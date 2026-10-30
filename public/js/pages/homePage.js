import { initHomeRouter } from "./homePageRouter.js";
import { config } from "../config.js";
import { clearOfflineCache } from "../offlineCache.js";
import {
  getHomepageData,
  createClub,
  answerInvitation,
} from "../api/clubApi.js";
import { renderClubs, renderInvitations } from "./homePageView.js";

initHomeRouter();
let currentClubs = [];

async function loadHomepage() {
  try {
    const data = await getHomepageData();
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

    renderInvitations(invitations, respondToInvitation);
  } catch (error) {
    console.error("Fehler beim Laden der Homepage:", error);

    document.getElementById("clubList").textContent =
      "Deine Buchclubs konnten nicht geladen werden.";

    document.getElementById("inviteList").textContent =
      "Deine Einladungen konnten nicht geladen werden.";
  }
}

const logoutButton = document.getElementById("logoutButton");

async function respondToInvitation(invitationId, status) {
  try {
    const data = await answerInvitation(invitationId, status);

    console.log("Einladung beantwortet:", data.responseInvitation);
    if (status === "ACCEPTED" && data.responseInvitation) {
      const club = data.responseInvitation;

      currentClubs.push({
        id: club.id,
        bookClubName: club.name,
        description: club.description,
      });

      renderClubs(currentClubs);
      window.location.hash = "clubs";
    }
    return true;
  } catch (error) {
    console.error("Fehler beim Antworten auf die Einladung:", error);

    return error instanceof TypeError
      ? "Verbindung zum Server fehlgeschlagen."
      : error.message;
  }
}
logoutButton.addEventListener("click", async function () {
  sessionStorage.removeItem("token");
  await clearOfflineCache();
  window.location.href = "loginPage.html";
});
if (config.useMockData) {
  import("../dev/mockData.js")
    .then(({ homepageClubs, homepageInvitations }) => {
      document.getElementById("username").textContent = "Testnutzer";
      currentClubs = homepageClubs.map((club) => ({ ...club }));
      renderClubs(currentClubs);
      renderInvitations(homepageInvitations, respondToInvitation);
    })
    .catch((error) => {
      console.error("Entwicklungsdaten konnten nicht geladen werden:", error);
    });
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
    const data = await createClub(clubData);

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
