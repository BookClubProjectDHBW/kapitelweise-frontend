const API_BASE_URL = "http://localhost:8181/api";

const params = new URLSearchParams(window.location.search);
const clubId = params.get("id");

function getAuthHeaders() {
  return {
    Authorization: `Bearer ${sessionStorage.getItem("token")}`,
  };
}

function showPageError(message) {
  const pageError = document.getElementById("pageError");
  pageError.textContent = message;
  pageError.classList.remove("d-none");
}

async function loadBookClub() {
  const response = await fetch(`${API_BASE_URL}/clubs/${clubId}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (response.status === 401) {
    sessionStorage.removeItem("token");
    window.location.href = "loginPage.html";
    return null;
  }

  if (response.status === 403) {
    throw new Error("Du hast keinen Zugriff auf diesen Buchclub.");
  }

  if (response.status === 404) {
    throw new Error("Dieser Buchclub wurde nicht gefunden.");
  }

  if (!response.ok) {
    throw new Error("Die Buchclub-Daten konnten nicht geladen werden.");
  }

  return response.json();
}

async function loadMembers() {
  const response = await fetch(`${API_BASE_URL}/clubs/${clubId}/members`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (response.status === 401) {
    sessionStorage.removeItem("token");
    window.location.href = "loginPage.html";
    return null;
  }

  if (!response.ok) {
    throw new Error("Die Mitglieder konnten nicht geladen werden.");
  }

  return response.json();
}

async function loadCurrentUser() {
  const response = await fetch(`${API_BASE_URL}/users/me`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (response.status === 401) {
    sessionStorage.removeItem("token");
    window.location.href = "loginPage.html";
    return null;
  }

  if (!response.ok) {
    throw new Error("Deine Benutzerdaten konnten nicht geladen werden.");
  }

  return response.json();
}

function renderBookClub(bookClub) {
  document.getElementById("name").textContent = bookClub.clubName;
  document.getElementById("title").textContent =
    bookClub.bookTitle ?? "Noch kein Buch ausgewählt";

  document.getElementById("edition").textContent = "–";
  document.getElementById("isbn").textContent = "–";
  document.getElementById("targetDate").textContent = "–";
}

function renderMembers(members) {
  const membersList = document.getElementById("membersList");
  membersList.replaceChildren();

  if (members.length === 0) {
    membersList.textContent = "Es sind keine Mitglieder vorhanden.";
    return;
  }

  members.forEach((member) => {
    const listItem = document.createElement("li");
    listItem.className = "list-group-item d-flex justify-content-between";

    const username = document.createElement("span");
    username.textContent = member.username;
    listItem.append(username);

    if (member.role?.toLowerCase() === "admin") {
      const adminLabel = document.createElement("span");
      adminLabel.className = "badge text-bg-secondary";
      adminLabel.textContent = "Admin";
      listItem.append(adminLabel);
    }

    membersList.append(listItem);
  });
}

function updateMemberCount(members) {
  document.getElementById("memberCount").textContent = members.length;
}

//Navigation zwischen Tabs
const navigation = document.getElementById("bookclubNavigation");

navigation.addEventListener("click", (event) => {
  const clickedTab = event.target.closest(".nav-tab");

  if (!clickedTab) {
    return;
  }

  navigation.querySelectorAll(".nav-tab").forEach((tab) => {
    tab.classList.remove("active");
  });

  clickedTab.classList.add("active");

  const membersPanel = document.getElementById("membersPanel");

  if (clickedTab.dataset.panel === "membersPanel") {
    membersPanel.classList.remove("d-none");
  } else {
    membersPanel.classList.add("d-none");
  }
});

//Adminrolle prüfen
function isCurrentUserAdmin(members, currentUsername) {
  const currentMember = members.find(
    (member) => member.username.toLowerCase() === currentUsername.toLowerCase(),
  );

  return currentMember?.role?.toLowerCase() === "admin";
}

//Dialog-Elemente, Öffnen und Schließen
const invitationDialog = document.getElementById("invitationDialog");
const invitationForm = document.getElementById("invitationForm");
const invitedUsernameInput = document.getElementById("invitedUsername");
const invitationStatus = document.getElementById("invitationStatus");
const closeInvitationDialogButton = document.getElementById(
  "closeInvitationDialog",
);
const cancelInvitationButton = document.getElementById("cancelInvitation");

function resetInvitationDialog() {
  invitationForm.reset();
  invitationStatus.textContent = "";
  invitationStatus.className = "invitation-status";
}

function openInvitationDialog() {
  resetInvitationDialog();
  invitationDialog.showModal();
  invitedUsernameInput.focus();
}

function closeInvitationDialog() {
  invitationDialog.close();
}

closeInvitationDialogButton.addEventListener("click", closeInvitationDialog);
cancelInvitationButton.addEventListener("click", closeInvitationDialog);

invitationDialog.addEventListener("close", resetInvitationDialog);

//Einladungen verschicken
async function sendInvitation(username) {
  const response = await fetch(`${API_BASE_URL}/clubs/${clubId}/invitations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ username }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.message || "Die Einladung konnte nicht verschickt werden.",
    );
  }

  return response.json();
}

//Formular absenden, Status anzeigen
invitationForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const username = invitedUsernameInput.value.trim();

  if (!username) {
    invitationStatus.textContent = "Bitte gib einen Benutzernamen ein.";
    invitationStatus.className = "invitation-status error";
    return;
  }

  try {
    await sendInvitation(username);
    invitationStatus.textContent =
      "Die Einladung wurde erfolgreich verschickt.";
    invitationStatus.className = "invitation-status success";
    invitationForm.reset();
  } catch (error) {
    invitationStatus.textContent = error.message;
    invitationStatus.className = "invitation-status error";
  }
});

//Adminbutton erstellen
function addInvitationButtonIfAdmin(isAdmin) {
  const adminActions = document.getElementById("adminActions");
  adminActions.replaceChildren();

  if (!isAdmin) {
    return;
  }

  const invitationButton = document.createElement("button");
  invitationButton.type = "button";
  invitationButton.className = "admin-invitation-button";
  invitationButton.textContent = "Mitglied einladen";
  invitationButton.addEventListener("click", openInvitationDialog);

  adminActions.append(invitationButton);
}

//Startpunkt der Seite
async function init() {
  if (!clubId) {
    showPageError("Es wurde kein Buchclub ausgewählt.");
    return;
  }

  if (!sessionStorage.getItem("token")) {
    window.location.href = "loginPage.html";
    return;
  }

  try {
    const [bookClub, members, currentUser] = await Promise.all([
      loadBookClub(),
      loadMembers(),
      loadCurrentUser(),
    ]);

    renderBookClub(bookClub);
    renderMembers(members);
    updateMemberCount(members);

    const isAdmin = isCurrentUserAdmin(members, currentUser.username);
    addInvitationButtonIfAdmin(isAdmin);
  } catch (error) {
    console.error(error);
    showPageError(
      error.message || "Die Buchclub-Seite konnte nicht geladen werden.",
    );
  }
}

init();
