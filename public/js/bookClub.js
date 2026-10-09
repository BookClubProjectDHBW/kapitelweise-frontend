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

function isCurrentUserAdmin(bookClub, currentUserId) {
  const currentMember = bookClub.members.find(
    (member) => member.userId === currentUserId,
  );

  return currentMember?.role === "admin";
}

function addInvitationTabIfAdmin(bookClub, currentUserId) {
  if (!isCurrentUserAdmin(bookClub, currentUserId)) {
    return;
  }

  const navigation = document.getElementById("bookclubNavigation");

  const invitationTab = document.createElement("button");
  invitationTab.type = "button";
  invitationTab.className = "nav-tab";
  invitationTab.textContent = "Einladungen";

  invitationTab.addEventListener("click", () => {
    console.log("Einladungsbereich öffnen");

    // später Formular oder eine eigene Einladungsansicht hinzufügen
  });

  navigation.append(invitationTab);
}

addInvitationTabIfAdmin(bookClub, currentUserId);
