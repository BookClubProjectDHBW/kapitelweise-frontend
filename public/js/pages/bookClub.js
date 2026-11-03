import { config } from "../config.js";
import { clearOfflineCache } from "../offlineCache.js";
import {
  getBookClub,
  inviteUserToClub,
  leaveBookClub,
} from "../api/clubApi.js";
import {
  searchBooks,
  submitBookProposal,
  getClubSuggestions,
  setCurrentBook,
  getCurrentBook,
  finishCurrentBook,
} from "../api/bookApi.js";
import {
  renderBookClub,
  renderBookSearchResults,
  renderClubSuggestions,
  renderCurrentBook,
  renderMeetings,
} from "./bookClubView.js";
import {
  createMeeting,
  getMeetings,
  getAttendanceOverview,
  setMeetingAttendance,
} from "../api/meetingApi.js";
const clubId = new URLSearchParams(window.location.search).get("id");

let currentBookClub = null;
let hasSelectedCurrentBook = false;
let devData = null;
let selectedBook = null;
let activeBookSearchController = null;
let suggestionsRefreshTimer = null;

const navigation = document.getElementById("bookclubNavigation");
const invitationDialog = document.getElementById("invitationDialog");
const invitationForm = document.getElementById("invitationForm");
const invitedUsernameInput = document.getElementById("invitedUsername");
const invitationStatus = document.getElementById("invitationStatus");
const leaveClubButton = document.getElementById("leaveClubButton");
const leaveClubDialog = document.getElementById("leaveClubDialog");
const leaveClubStatus = document.getElementById("leaveClubStatus");
const cancelLeaveClub = document.getElementById("cancelLeaveClub");
const confirmLeaveClub = document.getElementById("confirmLeaveClub");
const closeInvitationDialogButton = document.getElementById(
  "closeInvitationDialog",
);

const cancelInvitationButton = document.getElementById("cancelInvitation");

const bookSearchForm = document.getElementById("bookSearchForm");
const bookSearchType = document.getElementById("bookSearchType");
const bookSearchInput = document.getElementById("bookSearchInput");
const resultsContainer = document.getElementById("bookSearchResults");

const confirmationDialog = document.getElementById("confirmationDialog");
const confirmationDialogTitle = document.getElementById(
  "confirmationDialogTitle",
);
const confirmationMessage = document.getElementById("confirmationMessage");
const confirmationSubmit = document.getElementById("confirmationSubmit");

function confirmBookAction(title, message, buttonLabel) {
  if (confirmationDialog.open) {
    return Promise.resolve(false);
  }

  confirmationDialogTitle.textContent = title;
  confirmationMessage.textContent = message;
  confirmationSubmit.textContent = buttonLabel;
  confirmationDialog.returnValue = "cancel";

  return new Promise((resolve) => {
    confirmationDialog.addEventListener(
      "close",
      () => resolve(confirmationDialog.returnValue === "confirm"),
      { once: true },
    );
    confirmationDialog.showModal();
  });
}

async function chooseCurrentBook(book, button) {
  const status = document.getElementById("clubSuggestionsStatus");

  const confirmed = await confirmBookAction(
    "Nächstes Buch auswählen",
    `Möchtest du „${book.title}“ als nächstes Buch auswählen? Diese Auswahl kann nicht rückgängig gemacht werden.`,
    "Buch auswählen",
  );

  if (!confirmed) {
    return;
  }

  button.disabled = true;
  status.textContent = "Buch wird ausgewählt...";
  status.className = "text-secondary";

  try {
    const currentBook = await setCurrentBook(clubId, book.id);

    hasSelectedCurrentBook = true;

    renderCurrentBook(currentBook);
    showFinishBookButton();
    document.getElementById("clubSuggestionsList").replaceChildren();

    status.textContent = `"${book.title}" wurde als nächstes Buch ausgewählt.`;
    status.className = "text-success";
  } catch (error) {
    status.textContent = error.message;
    status.className = "text-danger";
    button.disabled = false;
  }
}

async function loadClubSuggestions() {
  clearTimeout(suggestionsRefreshTimer);
  suggestionsRefreshTimer = null;
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
    // Ein Fehler beim aktuellen Buch darf das Laden der Vorschläge nicht blockieren
    try {
      const currentBook = await getCurrentBook(clubId);
      hasSelectedCurrentBook = currentBook !== null;

      if (currentBook) {
        renderCurrentBook(currentBook);
      }
    } catch (error) {
      console.error("Aktuelles Buch konnte nicht geladen werden:", error);
    }

    const suggestions = await getClubSuggestions(clubId);

    if (!Array.isArray(suggestions)) {
      throw new Error("Ungültiges Antwortformat der Vorschlags-API.");
    }
    if (suggestions.length === 0) {
      status.textContent = "Noch keine Buchvorschläge vorhanden.";
      return;
    }

    renderClubSuggestions(
      suggestions,
      currentBookClub?.role === "ADMIN" && !hasSelectedCurrentBook,
      chooseCurrentBook,
    );

    status.textContent = "";
    const hasPendingSuggestions = suggestions.some(function (suggestion) {
      return suggestion.suggestion_status === "PENDING";
    });

    if (
      hasPendingSuggestions &&
      document.getElementById("votingTab").classList.contains("active")
    ) {
      suggestionsRefreshTimer = setTimeout(loadClubSuggestions, 5000);
    }
  } catch (error) {
    console.error("Fehler beim Laden der Buchvorschläge:", error);

    status.textContent = navigator.onLine
      ? error.message
      : "Offline nicht verfügbar";

    status.className = "text-danger";
  }
}

async function loadMeetings() {
  const status = document.getElementById("meetingStatus");
  const list = document.getElementById("meetingList");
  list.replaceChildren();

  if (config.useMockData) {
    const currentMember = currentBookClub.members.find(
      (member) => member.userId === devData.currentUserId,
    );

    renderMeetings(
      devData.mockMeetings,
      currentMember?.role === "admin",

      async (meetingId, answer) => {
        const meeting = devData.mockMeetings.find(
          (item) => item.id === meetingId,
        );

        if (!meeting) {
          throw new Error("Treffen nicht gefunden.");
        }

        meeting.my_attendance_status = answer;

        const currentUser = devData.users.find(
          (user) => user.userId === devData.currentUserId,
        );

        const attendance = devData.mockMeetingAttendance[meetingId]?.find(
          (entry) => entry.username === currentUser.username,
        );

        if (attendance) {
          attendance.status = answer;
        }
      },

      async (meetingId) => {
        return {
          attendees: devData.mockMeetingAttendance[meetingId] ?? [],
        };
      },
    );

    status.textContent = "";
    return true;
  }

  if (!clubId || !currentBookClub) {
    status.textContent = "Der Buchclub ist noch nicht geladen.";
    return;
  }
  status.textContent = "Treffen werden geladen...";
  status.className = "mt-3 text-secondary";
  try {
    const meetings = await getMeetings(clubId);
    renderMeetings(
      meetings,
      currentBookClub.role === "ADMIN",
      async (meetingId, answer) => {
        await setMeetingAttendance(clubId, meetingId, answer);
        await loadMeetings();
      },
      (meetingId) => getAttendanceOverview(clubId, meetingId),
    );
    status.textContent = "";
    return true;
  } catch (error) {
    status.textContent = navigator.onLine
      ? error.message
      : "Offline nicht verfügbar";
    status.className = "mt-3 text-danger";
    return false;
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
  document
    .getElementById("meetingPanel")
    .classList.toggle("d-none", clickedTab.id !== "meetingTab");

  if (clickedTab.id === "meetingTab") {
    loadMeetings();
  }

  if (clickedTab.id === "votingTab") {
    loadClubSuggestions();
  } else {
    clearTimeout(suggestionsRefreshTimer);
    suggestionsRefreshTimer = null;
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

function showFinishBookButton() {
  const adminActions = document.getElementById("adminActions");

  document.getElementById("finishBookButton")?.remove();

  if (currentBookClub?.role !== "ADMIN" || !hasSelectedCurrentBook) {
    return;
  }

  const button = document.createElement("button");
  button.id = "finishBookButton";
  button.type = "button";
  button.className = "btn btn-confirm";
  button.textContent = "Buch abschließen";

  button.addEventListener("click", async function () {
    const confirmed = await confirmBookAction(
      "Buch abschließen",
      "Möchtest du das aktuelle Buch wirklich abschließen?",
      "Buch abschließen",
    );

    if (!confirmed) {
      return;
    }

    button.disabled = true;
    button.textContent = "Wird abgeschlossen...";

    try {
      await finishCurrentBook(clubId);

      hasSelectedCurrentBook = false;
      currentBookClub.currentBook = null;

      renderBookClub(currentBookClub);
      showFinishBookButton();

      if (document.getElementById("votingTab").classList.contains("active")) {
        await loadClubSuggestions();
      }
    } catch (error) {
      window.alert(error.message);
      button.disabled = false;
      button.textContent = "Buch abschließen";
    }
  });

  adminActions.appendChild(button);
}
function showMeetingButton(isAdmin) {
  const button = document.getElementById("newMeetingButton");

  button.classList.toggle("d-none", !isAdmin);

  if (!isAdmin) {
    document.getElementById("meetingForm").classList.add("d-none");
  }
}

function showLeaveClubButton(isMember) {
  leaveClubButton.classList.toggle("d-none", !isMember);
}

leaveClubButton.addEventListener("click", function () {
  leaveClubStatus.textContent = "";
  leaveClubStatus.className = "mt-3";
  leaveClubDialog.showModal();
});

cancelLeaveClub.addEventListener("click", function () {
  leaveClubDialog.close();
});

confirmLeaveClub.addEventListener("click", async function () {
  confirmLeaveClub.disabled = true;
  leaveClubStatus.textContent = "Buchclub wird verlassen...";
  leaveClubStatus.className = "mt-3 text-secondary";

  try {
    const success = await leaveBookClub(clubId);

    if (!success) {
      throw new Error("Der Buchclub konnte nicht verlassen werden.");
    }

    await clearOfflineCache();
    window.location.href = "../spa/";
  } catch (error) {
    leaveClubStatus.textContent = error.message;
    leaveClubStatus.className = "mt-3 text-danger";
  } finally {
    confirmLeaveClub.disabled = false;
  }
});
async function loadBookClub() {
  try {
    if (config.useMockData) {
      devData = await import("../dev/mockData.js");

      currentBookClub = devData.bookClub;

      renderBookClub(currentBookClub);

      const currentMember = currentBookClub.members.find(
        (member) => member.userId === devData.currentUserId,
      );
      showInvitationButton(currentBookClub.role === "ADMIN");
      showMeetingButton(currentBookClub.role === "ADMIN");
      showLeaveClubButton(currentBookClub.role === "MEMBER");
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
    showMeetingButton(currentBookClub.role === "ADMIN");
    showLeaveClubButton(currentBookClub.role === "MEMBER");

    try {
      const currentBook = await getCurrentBook(clubId);

      hasSelectedCurrentBook = currentBook !== null;

      if (currentBook) {
        renderCurrentBook(currentBook);
      }

      showFinishBookButton();
    } catch (error) {
      console.error("Aktuelles Buch konnte nicht geladen werden:", error);
    }
    await loadClubSuggestions();
  } catch (error) {
    console.error("Fehler beim Laden des Buchclubs:", error);

    document.getElementById("title").textContent =
      error.code === "FORBIDDEN"
        ? "Du bist kein Mitglied dieses Buchclubs."
        : !navigator.onLine
          ? "Offline nicht verfügbar"
          : "Der Buchclub konnte nicht geladen werden.";

    showInvitationButton(false);
  }
}

// Mit Hilfe der KI entwickelt
function showOfflineState() {
  document.getElementById("offlineNotice").classList.remove("d-none");

  document.querySelectorAll("button").forEach(function (button) {
    if (
      button.matches(
        ".nav-tab, #logoutButton, .dialog-cancel-button, #cancelMeetingButton",
      )
    ) {
      return;
    }

    button.disabled = true;
    button.title = "Offline nicht verfügbar";
  });
}

window.addEventListener("offline", showOfflineState);
let leavingPage = false;
window.addEventListener("beforeunload", function () {
  leavingPage = true;
});
window.addEventListener("online", function () {
  if (!leavingPage) {
    window.location.reload();
  }
});

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

document
  .getElementById("logoutButton")
  .addEventListener("click", async function () {
    sessionStorage.removeItem("token");
    await clearOfflineCache();
    window.location.href = "loginPage.html";
  });
const meetingForm = document.getElementById("meetingForm");
const newMeetingButton = document.getElementById("newMeetingButton");
const cancelMeetingButton = document.getElementById("cancelMeetingButton");
const meetingStatus = document.getElementById("meetingStatus");

newMeetingButton.addEventListener("click", function () {
  meetingForm.classList.remove("d-none");
  meetingStatus.textContent = "";
  document.getElementById("meetingTitle").focus();
});

cancelMeetingButton.addEventListener("click", function () {
  meetingForm.reset();
  meetingForm.classList.add("d-none");
  meetingStatus.textContent = "";
});

meetingForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const startsAt = document.getElementById("meetingStartsAt").value;
  const endsAt = document.getElementById("meetingEndsAt").value;

  if (new Date(startsAt).getTime() <= Date.now()) {
    meetingStatus.textContent = "Das Treffen muss in der Zukunft liegen.";
    meetingStatus.className = "mt-3 text-danger";
    return;
  }

  if (endsAt && new Date(endsAt).getTime() <= new Date(startsAt).getTime()) {
    meetingStatus.textContent = "Das Ende muss nach dem Beginn liegen.";
    meetingStatus.className = "mt-3 text-danger";
    return;
  }

  if (config.useMockData) {
    meetingStatus.textContent =
      "Im DEV-Modus können keine Treffen gespeichert werden.";
    meetingStatus.className = "mt-3 text-secondary";
    return;
  }

  const meeting = {
    title: document.getElementById("meetingTitle").value.trim(),
    description: document.getElementById("meetingDescription").value.trim(),
    starts_at: `${startsAt}:00`,
    ends_at: endsAt ? `${endsAt}:00` : null,
    location: document.getElementById("meetingLocation").value.trim(),
  };

  const submitButton = meetingForm.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  meetingStatus.textContent = "Treffen wird erstellt...";
  meetingStatus.className = "mt-3 text-secondary";

  try {
    await createMeeting(clubId, meeting);

    meetingForm.reset();
    meetingForm.classList.add("d-none");

    const updated = await loadMeetings();

    meetingStatus.textContent = updated
      ? "Treffen wurde erfolgreich erstellt."
      : "Treffen wurde erstellt, aber die Terminliste konnte nicht geladen werden.";

    meetingStatus.className = updated
      ? "mt-3 text-success"
      : "mt-3 text-warning";
  } catch (error) {
    meetingStatus.textContent = error.message;
    meetingStatus.className = "mt-3 text-danger";
  } finally {
    submitButton.disabled = false;
  }
});
loadBookClub();

if (!navigator.onLine) {
  showOfflineState();
}
