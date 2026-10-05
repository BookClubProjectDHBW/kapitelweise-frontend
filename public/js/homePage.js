// Aktuelles Jahr automatisch einsetzen
document.getElementById("currentYear").textContent = new Date().getFullYear();

// Logout-Demonstration
document.getElementById("logoutButton").addEventListener("click", function () {
  const shouldLogout = window.confirm("Möchtest du dich wirklich ausloggen?");

  if (shouldLogout) {
    // In einer echten Anwendung würdest du hier die Logout-Route aufrufen.
    window.location.href = "login.html";
  }
});

// Formular für den Beitritt über einen Einladungslink
document
  .getElementById("joinClubForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const inviteInput = document.getElementById("inviteLink");
    const joinMessage = document.getElementById("joinMessage");
    const inviteLink = inviteInput.value.trim();

    joinMessage.classList.remove("d-none", "alert-success", "alert-danger");

    if (!inviteLink) {
      joinMessage.classList.add("alert-danger");
      joinMessage.textContent = "Bitte gib einen Einladungslink ein.";
      inviteInput.focus();
      return;
    }

    if (!inviteInput.checkValidity()) {
      joinMessage.classList.add("alert-danger");
      joinMessage.textContent = "Bitte gib einen gültigen Einladungslink ein.";
      inviteInput.focus();
      return;
    }

    joinMessage.classList.add("alert-success");
    joinMessage.textContent =
      "Der Einladungslink wurde angenommen. In der echten Anwendung wirst du jetzt zum Buchclub weitergeleitet.";
  });
