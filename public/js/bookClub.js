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

  document
    .getElementById("bookSearchPanel")
    .classList.toggle("d-none", clickedTab.id !== "votingTab");
});
function isCurrentUserAdmin(bookClub, currentUserId) {
  const currentMember = bookClub.members.find(
    (member) => member.userId === currentUserId,
  );

  return currentMember?.role === "admin";
}
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

addInvitationButtonIfAdmin(bookClub, currentUserId);
const bookSearchForm = document.getElementById("bookSearchForm");
const bookSearchType = document.getElementById("bookSearchType");
const bookSearchInput = document.getElementById("bookSearchInput");

let selectedBook = null;

bookSearchForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const searchType = bookSearchType.value;
  const searchTerm = bookSearchInput.value.trim();
  const resultsContainer = document.getElementById("bookSearchResults");

  if (searchTerm === "") {
    return;
  }

  selectedBook = null;

  const searchParams = new URLSearchParams({
    [searchType]: searchTerm,
  });



  resultsContainer.textContent = "Bücher werden gesucht...";

  try {
    const response = await fetch(
      `http://localhost:8383/bookSearch?${searchParams}`,
    );

    if (!response.ok) {
      throw new Error(`HTTP-Fehler: ${response.status}`);
    }

    const data = await response.json();

    console.log("Gefundene Bücher:", data.docs);

    resultsContainer.replaceChildren();

    if (data.docs.length === 0) {
      resultsContainer.textContent = "Keine Bücher gefunden.";
      return;
    }

    data.docs.slice(0, 10).forEach(function (book) {
      const card = document.createElement("div");
      card.className = "card mb-3";

      const cardBody = document.createElement("div");
      cardBody.className = "card-body d-flex align-items-start gap-3";

      if (book.cover_i) {
        const cover = document.createElement("img");
        cover.src = `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`;
        cover.alt = `Cover von ${book.title}`;
        cover.className = "rounded flex-shrink-0";
        cover.style.width = "100px";
        cover.style.height = "150px";
        cover.style.objectFit = "cover";

        cardBody.appendChild(cover);
      }

      const title = document.createElement("h3");
      title.className = "h5";
      title.textContent = book.title || "Unbekannter Titel";

      const author = document.createElement("p");
      author.className = "mb-1";
      author.textContent = `Autor: ${book.author_name?.join(", ") || "Unbekannt"}`;

      const year = document.createElement("p");
      year.className = "text-secondary mb-0";
      year.textContent = `Erstveröffentlichung: ${book.first_publish_year || "Unbekannt"}`;

      const bookInfo = document.createElement("div");

      const suggestButton = document.createElement("button");
      suggestButton.type = "button";
      suggestButton.className = "btn btn-confirm mt-2";
      suggestButton.textContent = "Buch vorschlagen";

      const selectionMessage = document.createElement("p");
      selectionMessage.className =
        "book-selection-message text-secondary mt-2 mb-0";

      suggestButton.addEventListener("click", function () {
        selectedBook = book;

        document
          .querySelectorAll(".book-selection-message")
          .forEach(function (message) {
            message.textContent = "";
          });

        selectionMessage.textContent = `"${book.title}" ausgewählt. Der Vorschlag wurde noch nicht eingereicht.`;

        console.log("Ausgewähltes Buch:", selectedBook);
      });

      bookInfo.append(title, author, year, suggestButton, selectionMessage);
      cardBody.appendChild(bookInfo);

      card.appendChild(cardBody);
      resultsContainer.appendChild(card);
    });
  } catch (error) {
    console.error("Fehler bei der Büchersuche:", error);
    resultsContainer.textContent =
      "Die Büchersuche ist momentan nicht verfügbar.";
  }
});
