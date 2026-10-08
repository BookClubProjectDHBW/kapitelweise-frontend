const navigation = document.getElementById("bookclubNavigation");

function getInviteableUsers(bookClub, users) {
  const memberIds = bookClub.members.map((member) => member.userId);

  return users.filter((user) => !memberIds.includes(user.userId));
}

function renderInvitationTab(bookClub, users) {
  const tabContent = document.getElementById("tabContent");

  tabContent.innerHTML = `
    <div class="invitation-panel">
      <h2>Mitglied einladen</h2>
      <p>Suche nach einem Benutzernamen und wähle eine Person aus.</p>

      <label class="user-search-label" for="userSearch">Benutzername</label>
      <input
        id="userSearch"
        class="user-search"
        type="search"
        placeholder="Zum Beispiel: sophie.romane"
        autocomplete="off"
      />

      <ul id="userResults" class="user-results"></ul>

      <button id="sendInvitationButton" class="invitation-submit" type="button" disabled>
        Einladung senden
      </button>

      <p id="invitationMessage" class="invitation-message"></p>
    </div>
  `;

  const searchInput = document.getElementById("userSearch");
  const resultsList = document.getElementById("userResults");
  const sendButton = document.getElementById("sendInvitationButton");
  const message = document.getElementById("invitationMessage");
  const inviteableUsers = getInviteableUsers(bookClub, users);
  let selectedUser = null;

  function renderResults(searchTerm = "") {
    const normalizedSearchTerm = searchTerm.trim().toLowerCase();
    const matchingUsers = inviteableUsers.filter((user) =>
      user.username.toLowerCase().includes(normalizedSearchTerm),
    );

    resultsList.innerHTML = "";

    if (!normalizedSearchTerm) {
      return;
    }

    if (matchingUsers.length === 0) {
      resultsList.innerHTML = "<li>Kein passender Nutzer gefunden.</li>";
      return;
    }

    matchingUsers.forEach((user) => {
      const resultItem = document.createElement("li");
      const resultButton = document.createElement("button");

      resultButton.type = "button";
      resultButton.className = "user-result";
      resultButton.textContent = user.username;

      resultButton.addEventListener("click", () => {
        selectedUser = user;
        searchInput.value = user.username;
        sendButton.disabled = false;
        message.textContent = `${user.username} wurde ausgewählt.`;

        resultsList.innerHTML = "";
      });

      resultItem.append(resultButton);
      resultsList.append(resultItem);
    });
  }

  searchInput.addEventListener("input", () => {
    selectedUser = null;
    sendButton.disabled = true;
    message.textContent = "";

    renderResults(searchInput.value);
  });

  sendButton.addEventListener("click", () => {
    if (!selectedUser) {
      return;
    }

    // Später Block ersetzen durch einen POST-Request ans Backend
    message.textContent = `Einladung an ${selectedUser.username} wurde gesendet.`;
    sendButton.disabled = true;
    searchInput.value = "";
    selectedUser = null;
  });
}

navigation.addEventListener("click", (event) => {
  const clickedTab = event.target.closest(".nav-tab");

  if (!clickedTab) {
    return;
  }

  navigation.querySelectorAll(".nav-tab").forEach((tab) => {
    tab.classList.remove("active");
  });

  clickedTab.classList.add("active");

  if (clickedTab.textContent !== "Einladungen") {
    document.getElementById("tabContent").innerHTML = "";
  }
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
    renderInvitationTab(bookClub, users);
  });

  navigation.append(invitationTab);
}

addInvitationTabIfAdmin(bookClub, currentUserId);
