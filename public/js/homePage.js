const DEV_MODE = false;

const HOMEPAGE_QUERY = `
  query {
    member {
      id
      name
      membership {
        id
        name
        description
      }
      invitationPending {
        id
        createdAt
        bookclub {
          id
          name
          description
        }
        invitedBy {
          id
          name
        }
      }
    }
  }
`;

const CREATE_CLUB_MUTATION = `
  mutation CreateClub($input: BookClubInput!) {
    createNewBookClub(bookClubInput: $input) {
      id
      name
      description
    }
  }
`;

const RESPOND_INVITATION_MUTATION = `
  mutation Respond($input: InvitationInput!) {
    responseInvitation(invitationInput: $input) {
      id
      name
      description
    }
  }
`;

async function graphqlRequest(query, variables = {}) {
  const response = await fetch("http://localhost:8383/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${sessionStorage.getItem("token")}`,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (response.status === 401) {
    sessionStorage.removeItem("token");
    window.location.href = "loginPage.html";
    throw new Error("Deine Anmeldung ist abgelaufen.");
  }

  if (!response.ok) {
    throw new Error(`HTTP-Fehler: ${response.status}`);
  }

  const result = await response.json();

  if (result.errors?.length) {
    throw new Error(result.errors[0].message);
  }

  return result.data;
}

let currentClubs = [];

async function loadHomepage() {
  try {
    const data = await graphqlRequest(HOMEPAGE_QUERY);
    const member = data.member;

    document.getElementById("username").textContent = member.name;

    const clubs = member.membership.map(function (club) {
      return {
        id: club.id,
        bookClubName: club.name,
        description: club.description,
      };
    });

    currentClubs = clubs;
    renderClubs(currentClubs);

    const invitations = member.invitationPending.map(function (invitation) {
      return {
        invitationId: invitation.id,
        clubId: invitation.bookclub.id,
        clubName: invitation.bookclub.name,
        description: invitation.bookclub.description,
      };
    });

    renderInvitations(invitations);
  } catch (error) {
    console.error("Fehler beim Laden der Homepage:", error);

    document.getElementById("clubList").textContent =
      "Deine Buchclubs konnten nicht geladen werden.";

    document.getElementById("inviteList").textContent =
      "Deine Einladungen konnten nicht geladen werden.";
  }
}

async function loadUser() {
  try {
    const response = await fetch("http://localhost:8181/users/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
    });
    if (response.status === 401) {
      sessionStorage.removeItem("token");
      window.location.href = "loginPage.html";
      return;
    }
    if (!response.ok) {
      console.error(
        "Benutzerdaten konnten nicht geladen werden:",
        response.status,
      );
      return;
    }
    const data = await response.json();
    document.getElementById("username").textContent = data.username;
  } catch (error) {
    console.error("Fehler beim Laden der Benutzerdaten:", error);
  }
}
const logoutButton = document.getElementById("logoutButton");
async function loadClubs() {
  const clubList = document.getElementById("clubList");
  clubList.replaceChildren();
  clubList.textContent = "Buchclubs werden geladen...";
  try {
    const response = await fetch("http://localhost:8181/clubs", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
    });
    if (response.status === 401) {
      sessionStorage.removeItem("token");
      window.location.href = "loginPage.html";
      return;
    }
    if (!response.ok) {
      throw new Error(`HTTP-Fehler: ${response.status}`);
    }
    const clubs = await response.json();
    renderClubs(clubs);
  } catch (error) {
    console.error("Fehler beim Laden der Buchclubs:", error);
    clubList.textContent = "Deine Buchclubs konnten nicht geladen werden.";
  }
}
const clubImages = [
  "../images/club1.webp",
  "../images/club2.webp",
  "../images/club3.webp",
  "../images/club4.webp",
  "../images/club5.webp",
  "../images/club6.webp",
  "../images/club7.webp",
  "../images/club8.webp",
  "../images/club9.webp",
  "../images/club10.webp",
];
function renderClubs(clubs) {
  const clubList = document.getElementById("clubList");
  clubList.replaceChildren();
  if (clubs.length === 0) {
    clubList.textContent =
      "Du bist noch in keinem Buchclub. Gründe deinen ersten Club!";
    return;
  }
  clubs.forEach(function (club) {
    const column = document.createElement("div");
    column.className = "col-12 col-md-6 col-lg-4";
    const card = document.createElement("div");
    card.className = "card h-100 shadow-sm";
    const imageIndex = club.id % clubImages.length;
    const image = document.createElement("img");
    image.className = "card-img-top club-card-image";
    image.src = clubImages[imageIndex];
    image.alt = `Bild für ${club.bookClubName}`;
    card.appendChild(image);
    card.dataset.clubId = club.id;

    const cardBody = document.createElement("div");
    cardBody.className = "card-body";

    const title = document.createElement("h3");
    title.className = "card-title h5";
    title.textContent = club.bookClubName;

    const description = document.createElement("p");
    description.className = "card-text text-secondary";
    description.textContent =
      club.description || "Keine Beschreibung vorhanden.";

    const openButton = document.createElement("a");
    openButton.className = "btn btn-outline-botanical";
    openButton.textContent = "Club öffnen";
    openButton.href = `bookClub.html?id=${club.id}`;

    if (club.id == null) {
      openButton.removeAttribute("href");
      openButton.classList.add("disabled");
      openButton.setAttribute("aria-disabled", "true");
    }
    cardBody.append(title, description, openButton);
    card.appendChild(cardBody);
    column.appendChild(card);
    clubList.appendChild(column);
  });
}
async function respondToInvitation(invitationId, status) {
  try {
    const data = await graphqlRequest(RESPOND_INVITATION_MUTATION, {
      input: {
        invitationId: String(invitationId),
        status: status,
      },
    });

    console.log("Einladung beantwortet:", data.responseInvitation);
    if (status === "ACCEPTED" && data.responseInvitation) {
      const club = data.responseInvitation;

      currentClubs.push({
        id: club.id,
        bookClubName: club.name,
        description: club.description,
      });

      renderClubs(currentClubs);
    }
    return true;
  } catch (error) {
    console.error("Fehler beim Antworten auf die Einladung:", error);

    return error instanceof TypeError
      ? "Verbindung zum Server fehlgeschlagen."
      : error.message;
  }
}
function removeInvitationCard(card) {
  card.remove();
  const inviteList = document.getElementById("inviteList");
  if (inviteList.children.length === 0) {
    inviteList.textContent = "Du hast aktuell keine offenen Einladungen.";
  }
}
async function loadInvitations() {
  const inviteList = document.getElementById("inviteList");
  inviteList.replaceChildren();
  inviteList.textContent = "Einladungen werden geladen...";
  try {
    const response = await fetch("http://localhost:8181/clubs/invitations", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
    });
    if (response.status === 401) {
      sessionStorage.removeItem("token");
      window.location.href = "loginPage.html";
      return;
    }
    if (!response.ok) {
      throw new Error(`HTTP-Fehler: ${response.status}`);
    }
    const invitations = await response.json();
    renderInvitations(invitations);
  } catch (error) {
    console.error("Fehler beim Laden der Einladungen:", error);
    inviteList.textContent = "Einladungen konnten nicht geladen werden.";
  }
}
function renderInvitations(invitations) {
  const inviteList = document.getElementById("inviteList");
  inviteList.replaceChildren();
  if (invitations.length === 0) {
    inviteList.textContent = "Du hast keine Einladungen.";
    return;
  }
  invitations.forEach(function (invitation) {
    const card = document.createElement("div");
    card.className = "card shadow-sm";

    const cardBody = document.createElement("div");
    cardBody.className = "card-body";
    card.appendChild(cardBody);
    inviteList.appendChild(card);

    const title = document.createElement("h3");
    title.className = "card-title h5";
    title.textContent = invitation.clubName;
    cardBody.appendChild(title);

    const description = document.createElement("p");
    description.className = "card-text text-secondary";
    description.textContent =
      invitation.description || "Keine Beschreibung vorhanden.";
    cardBody.appendChild(description);

    const acceptButton = document.createElement("button");
    acceptButton.type = "button";
    acceptButton.className = "btn btn-confirm";
    acceptButton.textContent = "Annehmen";

    const declineButton = document.createElement("button");
    declineButton.type = "button";
    declineButton.className = "btn btn-reject";
    declineButton.textContent = "Ablehnen";

    const buttonGroup = document.createElement("div");
    buttonGroup.className = "d-flex flex-wrap gap-2";

    const errorMessage = document.createElement("div");
    errorMessage.className = "alert alert-danger d-none mt-3";
    errorMessage.setAttribute("role", "alert");
    cardBody.appendChild(errorMessage);

    function setButtonsDisabled(disabled) {
      acceptButton.disabled = disabled;
      declineButton.disabled = disabled;
    }
    acceptButton.addEventListener("click", async function () {
      setButtonsDisabled(true);
      errorMessage.classList.add("d-none");
      errorMessage.textContent = "";
      const success = await respondToInvitation(
        invitation.invitationId,
        "ACCEPTED",
      );
      if (success === true) {
        removeInvitationCard(card);
      } else {
        errorMessage.textContent = success;
        errorMessage.classList.remove("d-none");
        setButtonsDisabled(false);
      }
    });
    declineButton.addEventListener("click", async function () {
      setButtonsDisabled(true);
      errorMessage.classList.add("d-none");
      errorMessage.textContent = "";
      const success = await respondToInvitation(
        invitation.invitationId,
        "DECLINED",
      );
      if (success === true) {
        removeInvitationCard(card);
      } else {
        errorMessage.textContent = success;
        errorMessage.classList.remove("d-none");
        setButtonsDisabled(false);
      }
    });
    buttonGroup.append(acceptButton, declineButton);
    cardBody.appendChild(buttonGroup);
  });
}
logoutButton.addEventListener("click", function () {
  sessionStorage.removeItem("token");
  window.location.href = "loginPage.html";
});
if (DEV_MODE) {
  document.getElementById("username").textContent = "Testnutzer";

  renderClubs([
    {
      id: 1,
      bookClubName: "Fantasyfreunde",
      description: "Gemeinsam Fantasybücher entdecken.",
    },
    {
      id: 2,
      bookClubName: "Krimirunde",
      description: "Jeden Monat ein spannender Krimi.",
    },
  ]);

  renderInvitations([
    {
      invitationId: 1,
      clubId: 3,
      clubName: "Die Leseratten",
      description: "Unser gemütlicher Leseclub.",
    },
  ]);
} else if (!sessionStorage.getItem("token")) {
  window.location.href = "loginPage.html";
} else {
  loadHomepage();
}
const createClubForm = document.getElementById("createClubForm");
const clubNameInput = document.getElementById("clubNameInput");
const createClubModal = document.getElementById("createClubModal");
const createClubError = document.getElementById("createClubError");
const createClubButton = createClubForm.querySelector('button[type="submit"]');

function showClubError(message) {
  createClubError.textContent = message;
  createClubError.classList.remove("d-none");
}
createClubForm.addEventListener("submit", async function (event) {
  event.preventDefault();
  if (createClubButton.disabled) {
    return;
  }
  createClubError.classList.add("d-none");
  createClubError.textContent = "";
  const name = clubNameInput.value.trim();
  const description = document
    .getElementById("clubDescriptionInput")
    .value.trim();
  clubNameInput.classList.remove("is-invalid");
  if (name === "") {
    clubNameInput.classList.add("is-invalid");
    return;
  }
  const clubData = {
    name: name,
    description: description,
  };
  console.log("Daten für das Backend:", clubData);
  createClubButton.disabled = true;
  try {
    const data = await graphqlRequest(CREATE_CLUB_MUTATION, {
      input: clubData,
    });

    const createdClub = data.createNewBookClub;

    console.log("Buchclub erstellt:", createdClub);

    const modal = bootstrap.Modal.getInstance(createClubModal);
    modal.hide();

    currentClubs.push({
      id: createdClub.id,
      bookClubName: createdClub.name,
      description: createdClub.description,
    });

    renderClubs(currentClubs);
  } catch (error) {
    console.error("Fehler beim Erstellen des Clubs:", error);
    showClubError(
      error instanceof TypeError
        ? "Verbindung zum Server fehlgeschlagen."
        : error.message,
    );
  } finally {
    createClubButton.disabled = false;
  }
});
createClubModal.addEventListener("hidden.bs.modal", function () {
  createClubForm.reset();
  clubNameInput.classList.remove("is-invalid");
  createClubError.classList.add("d-none");
  createClubError.textContent = "";
});
