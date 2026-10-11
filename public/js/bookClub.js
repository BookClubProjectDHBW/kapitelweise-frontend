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
});

//Adminrolle prüfen
function isCurrentUserAdmin(bookClub, currentUserId) {
  const currentMember = bookClub.members.find(
    (member) => member.userId === currentUserId,
  );

  return currentMember?.role === "admin";
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

//Mock-Prüfung der Einladung
function sendInvitationMock(bookClub, username) {
  const normalizedUsername = username.trim().toLowerCase();
  const invitedUser = users.find(
    (user) => user.username.toLowerCase() === normalizedUsername,
  );

  if (!invitedUser) {
    return {
      success: false,
      message: "Der Benutzername existiert nicht.",
    };
  }

  const isAlreadyMember = bookClub.members.some(
    (member) => member.userId === invitedUser.userId,
  );

  if (isAlreadyMember) {
    return {
      success: false,
      message: "Diese Person ist bereits Mitglied des Buchclubs.",
    };
  }

  return {
    success: true,
    message: "Die Einladung wurde erfolgreich verschickt.",
  };
}
//Formular absenden, Status anzeigen
invitationForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const username = invitedUsernameInput.value.trim();

  if (!username) {
    invitationStatus.textContent = "Bitte gib einen Benutzernamen ein.";
    invitationStatus.className = "invitation-status error";
    return;
  }

  const result = sendInvitationMock(bookClub, username);

  invitationStatus.textContent = result.message;
  invitationStatus.className = result.success
    ? "invitation-status success"
    : "invitation-status error";

  if (result.success) {
    invitationForm.reset();
  }
});

//Adminbutton erstellen
function addInvitationButtonIfAdmin(bookClub, currentUserId) {
  if (!isCurrentUserAdmin(bookClub, currentUserId)) {
    return;
  }

  const adminActions = document.getElementById("adminActions");
  const invitationButton = document.createElement("button");

  invitationButton.type = "button";
  invitationButton.className = "admin-invitation-button";
  invitationButton.textContent = "Mitglied einladen";

  invitationButton.addEventListener("click", openInvitationDialog);

  adminActions.append(invitationButton);
}

//Button für Admins hinzufügen
addInvitationButtonIfAdmin(bookClub, currentUserId);
