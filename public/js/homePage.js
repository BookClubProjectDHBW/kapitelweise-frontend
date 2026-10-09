async function loadUser() {
  try {
    const response = await fetch("http://localhost:8181/users/me", {
      method: "GET",
      credentials: "include",
    });

    if (response.status === 401) {
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
      credentials: "include",
    });

    if (response.status === 401) {
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
    openButton.className = "btn btn-outline-secondary";
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

logoutButton.addEventListener("click", async function () {
  try {
    const response = await fetch("http://localhost:8181/logout", {
      method: "POST",
      credentials: "include",
    });

    if (!response.ok) {
      console.error("Logout fehlgeschlagen:", response.status);
      return;
    }

    window.location.href = "loginPage.html";
  } catch (error) {
    console.error("Logout-Anfrage fehlgeschlagen:", error);
  }
});

loadUser();
loadClubs();

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
    const response = await fetch("http://localhost:8181/clubs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(clubData),
    });
    if (response.ok) {
      const createdClub = await response.json();
      console.log("Buchclub erstellt:", createdClub);

      const modal = bootstrap.Modal.getInstance(createClubModal);
      modal.hide();
      loadClubs();
    } else if (response.status === 400) {
      showClubError("Ungültige Eingaben. Bitte überprüfe deine Angaben.");
    } else if (response.status === 401) {
      showClubError(
        "Deine Anmeldung ist abgelaufen. Bitte melde dich erneut an.",
      );
    } else {
      showClubError("Der Buchclub konnte nicht erstellt werden.");
    }
  } catch (error) {
    console.error("Fehler beim Erstellen des Clubs:", error);
    showClubError("Verbindung zum Server fehlgeschlagen.");
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
