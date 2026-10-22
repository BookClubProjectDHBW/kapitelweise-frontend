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
export function renderClubs(clubs) {
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
    const numericId = Number(club.id);
    const imageIndex = Number.isInteger(numericId)
      ? ((numericId % clubImages.length) + clubImages.length) % clubImages.length
      : [...String(club.id)].reduce((sum, char) => sum + char.charCodeAt(0), 0) % clubImages.length;
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
    openButton.className = "btn btn-outline-botanical";
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

function removeInvitationCard(card) {
  card.remove();
  const inviteList = document.getElementById("inviteList");
  if (inviteList.children.length === 0) {
    inviteList.textContent = "Du hast aktuell keine offenen Einladungen.";
  }
}

export function renderInvitations(invitations, onInvitationResponse) {
  const inviteList = document.getElementById("inviteList");
  inviteList.replaceChildren();
  if (invitations.length === 0) {
    inviteList.textContent = "Du hast keine Einladungen.";
    return;
  }
  invitations.forEach(function (invitation) {
    const card = document.createElement("div");
    card.className = "card shadow-sm";

    const cardBody = document.createElement("div");
    cardBody.className = "card-body";
    card.appendChild(cardBody);
    inviteList.appendChild(card);

    const title = document.createElement("h3");
    title.className = "card-title h5";
    title.textContent = invitation.clubName;
    cardBody.appendChild(title);

    const description = document.createElement("p");
    description.className = "card-text text-secondary";
    description.textContent =
      invitation.description || "Keine Beschreibung vorhanden.";
    cardBody.appendChild(description);

    const acceptButton = document.createElement("button");
    acceptButton.type = "button";
    acceptButton.className = "btn btn-confirm";
    acceptButton.textContent = "Annehmen";

    const declineButton = document.createElement("button");
    declineButton.type = "button";
    declineButton.className = "btn btn-reject";
    declineButton.textContent = "Ablehnen";

    const buttonGroup = document.createElement("div");
    buttonGroup.className = "d-flex flex-wrap gap-2";

    const errorMessage = document.createElement("div");
    errorMessage.className = "alert alert-danger d-none mt-3";
    errorMessage.setAttribute("role", "alert");
    cardBody.appendChild(errorMessage);

    function setButtonsDisabled(disabled) {
      acceptButton.disabled = disabled;
      declineButton.disabled = disabled;
    }
    acceptButton.addEventListener("click", async function () {
      setButtonsDisabled(true);
      errorMessage.classList.add("d-none");
      errorMessage.textContent = "";
      const success = await onInvitationResponse(
        invitation.invitationId,
        "ACCEPTED",
      );
      if (success === true) {
        removeInvitationCard(card);
      } else {
        errorMessage.textContent = success;
        errorMessage.classList.remove("d-none");
        setButtonsDisabled(false);
      }
    });
    declineButton.addEventListener("click", async function () {
      setButtonsDisabled(true);
      errorMessage.classList.add("d-none");
      errorMessage.textContent = "";
      const success = await onInvitationResponse(
        invitation.invitationId,
        "DECLINED",
      );
      if (success === true) {
        removeInvitationCard(card);
      } else {
        errorMessage.textContent = success;
        errorMessage.classList.remove("d-none");
        setButtonsDisabled(false);
      }
    });
    buttonGroup.append(acceptButton, declineButton);
    cardBody.appendChild(buttonGroup);
  });
}