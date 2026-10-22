import { config } from "../config.js";
import { getBookClub, inviteUserToClub } from "../api/clubApi.js";
import {
  searchBooks,
  submitBookProposal,
  getClubSuggestions,
  setCurrentBook,
} from "../api/bookApi.js";
import {
  renderBookClub,
  renderBookSearchResults,
  renderClubSuggestions,
} from "./bookClubView.js";
const clubId = new URLSearchParams(window.location.search).get("id");

let currentBookClub = null;
let devData = null;
let selectedBook = null;
let activeBookSearchController = null;

const navigation = document.getElementById("bookclubNavigation");
const invitationDialog = document.getElementById("invitationDialog");
const invitationForm = document.getElementById("invitationForm");
const invitedUsernameInput = document.getElementById("invitedUsername");
const invitationStatus = document.getElementById("invitationStatus");

const closeInvitationDialogButton = document.getElementById(
  "closeInvitationDialog",
);

const cancelInvitationButton = document.getElementById("cancelInvitation");

const bookSearchForm = document.getElementById("bookSearchForm");
const bookSearchType = document.getElementById("bookSearchType");
const bookSearchInput = document.getElementById("bookSearchInput");
const resultsContainer = document.getElementById("bookSearchResults");

async function chooseCurrentBook(book, button) {
  const status = document.getElementById("clubSuggestionsStatus");

  button.disabled = true;
  status.textContent = "Buch wird ausgewählt...";
  status.className = "text-secondary";

  try {
    await setCurrentBook(clubId, book.id);

    status.textContent = `"${book.title}" wurde als nächstes Buch ausgewählt.`;
    status.className = "text-success";
  } catch (error) {
    status.textContent = error.message;
    status.className = "text-danger";
    button.disabled = false;
  }
}

async function loadClubSuggestions() {
  const status = document.getElementById("clubSuggestionsStatus");
  const list = document.getElementById("clubSuggestionsList");

  if (config.useMockData) {
    status.textContent =
      "Gespeicherte Buchvorschläge werden im DEV-Modus nicht geladen.";
    return;
  }

  if (!clubId) {
    status.textContent = "Keine Buchclub-ID vorhanden.";
    return;
  }

  list.replaceChildren();
  status.textContent = "Buchvorschläge werden geladen...";
  status.className = "text-secondary";

  try {
    const suggestions = await getClubSuggestions(clubId);

    if (!Array.isArray(suggestions)) {
      throw new Error("Ungültiges Antwortformat der Vorschlags-API.");
    }

    renderClubSuggestions(
      suggestions,
      currentBookClub?.role === "ADMIN",
      chooseCurrentBook,
    );
  } catch (error) {
    console.error("Fehler beim Laden der Buchvorschläge:", error);

    status.textContent = "Buchvorschläge konnten nicht geladen werden.";
    status.className = "text-danger";
  }
}

navigation.addEventListener("click", function (event) {
  const clickedTab = event.target.closest(".nav-tab");

  if (!clickedTab) {
    return;
  }

  navigation.querySelectorAll(".nav-tab").forEach(function (tab) {
    tab.classList.remove("active");
  });

  clickedTab.classList.add("active");

  document
    .getElementById("bookSearchPanel")
    .classList.toggle("d-none", clickedTab.id !== "votingTab");

  if (clickedTab.id === "votingTab") {
    loadClubSuggestions();
  }
});

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

invitationForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const username = invitedUsernameInput.value.trim();

  if (!username) {
    invitationStatus.textContent = "Bitte gib einen Benutzernamen ein.";
    invitationStatus.className = "invitation-status error";
    return;
  }

  const submitButton = invitationForm.querySelector('button[type="submit"]');

  submitButton.disabled = true;

  try {
    if (config.useMockData) {
      const result = devData.sendInvitationMock(currentBookClub, username);

      invitationStatus.textContent = result.message;
      invitationStatus.className = result.success
        ? "invitation-status success"
        : "invitation-status error";

      if (result.success) {
        invitationForm.reset();
      }
    } else {
      await inviteUserToClub(clubId, username);

      invitationStatus.textContent =
        "Die Einladung wurde erfolgreich verschickt.";

      invitationStatus.className = "invitation-status success";
      invitationForm.reset();
    }
  } catch (error) {
    invitationStatus.textContent = error.message;
    invitationStatus.className = "invitation-status error";
  } finally {
    submitButton.disabled = false;
  }
});

function showInvitationButton(isAdmin) {
  const adminActions = document.getElementById("adminActions");

  adminActions
    .querySelectorAll(".admin-invitation-button")
    .forEach(function (button) {
      button.remove();
    });

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

async function loadBookClub() {
  try {
    if (config.useMockData) {
      devData = await import("../dev/mockData.js");

      currentBookClub = devData.bookClub;

      renderBookClub(currentBookClub);

      const currentMember = currentBookClub.members.find(
        (member) => member.userId === devData.currentUserId,
      );

      showInvitationButton(currentMember?.role === "admin");
      return;
    }

    if (!sessionStorage.getItem("token")) {
      window.location.href = "loginPage.html";
      return;
    }

    if (!clubId) {
      throw new Error("Keine Buchclub-ID vorhanden.");
    }

    currentBookClub = await getBookClub(clubId);

    if (!currentBookClub) {
      throw new Error("Der Buchclub konnte nicht gefunden werden.");
    }

    renderBookClub(currentBookClub);

    showInvitationButton(currentBookClub.role === "ADMIN");
  } catch (error) {
    console.error("Fehler beim Laden des Buchclubs:", error);

    document.getElementById("title").textContent =
      error.code === "FORBIDDEN"
        ? "Du bist kein Mitglied dieses Buchclubs."
        : "Der Buchclub konnte nicht geladen werden.";

    showInvitationButton(false);
  }
}

bookSearchType.addEventListener("change", function () {
  const placeholders = {
    title: "Buchtitel eingeben...",
    author: "Autor eingeben...",
    isbn: "ISBN eingeben...",
  };

  bookSearchInput.placeholder = placeholders[bookSearchType.value];
});

async function selectBook(book, selectionMessage, suggestButton) {
  selectedBook = book;

  document
    .querySelectorAll(".book-selection-message")
    .forEach(function (message) {
      message.textContent = "";
    });

  if (config.useMockData) {
    selectionMessage.textContent = `"${book.title}" ausgewählt. Im DEV-Modus wird nichts eingereicht.`;
    return;
  }

  if (!clubId) {
    selectionMessage.textContent = "Keine Buchclub-ID vorhanden.";
    selectionMessage.className = "book-selection-message text-danger mt-2 mb-0";
    return;
  }

  suggestButton.disabled = true;
  selectionMessage.textContent = "Buchvorschlag wird eingereicht...";
  selectionMessage.className =
    "book-selection-message text-secondary mt-2 mb-0";

  try {
    await submitBookProposal(clubId, selectedBook);
    loadClubSuggestions();

    selectionMessage.textContent = "Buch erfolgreich vorgeschlagen!";
    selectionMessage.className =
      "book-selection-message text-success mt-2 mb-0";
  } catch (error) {
    console.error("Fehler beim Einreichen:", error);

    selectionMessage.textContent = error.message;
    selectionMessage.className = "book-selection-message text-danger mt-2 mb-0";
  } finally {
    suggestButton.disabled = false;
  }
}

bookSearchForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const searchType = bookSearchType.value;
  const searchTerm = bookSearchInput.value.trim();

  if (searchTerm === "") {
    return;
  }

  selectedBook = null;

  if (activeBookSearchController) {
    activeBookSearchController.abort();
  }

  const controller = new AbortController();
  activeBookSearchController = controller;

  resultsContainer.textContent = "Bücher werden gesucht...";

  try {
    let data;

    if (config.useMockData) {
      const { searchResults } = await import("../dev/mockData.js");

      const books = searchResults.filter(function (book) {
        let value;

        if (searchType === "title") {
          value = book.title;
        } else if (searchType === "author") {
          value = book.author;
        } else {
          value = book.isbn;
        }

        return value.toLowerCase().includes(searchTerm.toLowerCase());
      });

      data = { docs: books };
    } else {
      data = await searchBooks(searchType, searchTerm, controller.signal);
    }

    if (activeBookSearchController !== controller) {
      return;
    }

    renderBookSearchResults(data.docs, selectBook);
  } catch (error) {
    if (
      error.name === "AbortError" ||
      activeBookSearchController !== controller
    ) {
      return;
    }

    console.error("Fehler bei der Büchersuche:", error);

    resultsContainer.textContent =
      "Die Büchersuche ist momentan nicht verfügbar.";
  } finally {
    if (activeBookSearchController === controller) {
      activeBookSearchController = null;
    }
  }
});

document.getElementById("logoutButton").addEventListener("click", function () {
  sessionStorage.removeItem("token");
  window.location.href = "loginPage.html";
});

loadBookClub();
