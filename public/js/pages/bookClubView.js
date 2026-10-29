export function renderBookClub(club) {
  const book = club.currentBook;
  const name = club.bookClubName ?? club.name;

  const memberCountLabel = document.getElementById("memberCountLabel");
  const clubNameLine = document.querySelector(".club-name");
  const clubDescription = document.getElementById("clubDescription");
  const bookData = document.getElementById("currentBookData");
  const cover = document.getElementById("bookCover");

  document.getElementById("name").textContent = name ?? "Buchclub";
  cover.classList.add("d-none");

  if (book) {
    document.getElementById("memberCount").textContent = club.members.length;

    memberCountLabel.classList.remove("d-none");
    clubNameLine.classList.remove("d-none");
    clubDescription.classList.add("d-none");
    bookData.classList.remove("d-none");

    document.getElementById("title").textContent = book.title;
    document.getElementById("edition").textContent = book.edition;
    document.getElementById("isbn").textContent = book.isbn;
    document.getElementById("targetDate").textContent = book.targetDate;
  } else {
    memberCountLabel.classList.add("d-none");
    clubNameLine.classList.add("d-none");
    bookData.classList.add("d-none");

    document.getElementById("title").textContent = name ?? "Buchclub";

    clubDescription.textContent =
      club.description || "Keine Beschreibung vorhanden.";

    clubDescription.classList.remove("d-none");
  }
}

export function renderBookSearchResults(books, onSelectBook) {
  const resultsContainer = document.getElementById("bookSearchResults");

  resultsContainer.replaceChildren();

  if (books.length === 0) {
    resultsContainer.textContent = "Keine Bücher gefunden.";
    return;
  }

  books.slice(0, 10).forEach(function (book) {
    const card = document.createElement("div");
    card.className = "card mb-3";

    const cardBody = document.createElement("div");
    cardBody.className = "card-body d-flex align-items-start gap-3";

    const placeholder = document.createElement("div");
    placeholder.className =
      "rounded flex-shrink-0 bg-body-secondary d-flex align-items-center justify-content-center text-secondary text-center";

    placeholder.style.width = "100px";
    placeholder.style.height = "150px";
    placeholder.textContent = "Kein Cover";

    if (book.coverId) {
      const cover = document.createElement("img");

      cover.src = `https://covers.openlibrary.org/b/id/${book.coverId}-M.jpg`;
      cover.alt = `Cover von ${book.title}`;
      cover.className = "rounded flex-shrink-0";
      cover.style.width = "100px";
      cover.style.height = "150px";
      cover.style.objectFit = "cover";

      cover.addEventListener("error", function () {
        cover.replaceWith(placeholder);
      });

      cardBody.appendChild(cover);
    } else {
      cardBody.appendChild(placeholder);
    }

    const title = document.createElement("h3");
    title.className = "h5";
    title.textContent = book.title || "Unbekannter Titel";

    const author = document.createElement("p");
    author.className = "mb-1";
    author.textContent = `Autor: ${book.author || "Unbekannt"}`;

    const year = document.createElement("p");
    year.className = "text-secondary mb-0";
    year.textContent = `Erstveröffentlichung: ${book.firstPublishYear ?? "Unbekannt"}`;

    const bookInfo = document.createElement("div");

    const suggestButton = document.createElement("button");
    suggestButton.type = "button";
    suggestButton.className = "btn btn-confirm mt-2";
    suggestButton.textContent = "Buch vorschlagen";

    const selectionMessage = document.createElement("p");
    selectionMessage.className =
      "book-selection-message text-secondary mt-2 mb-0";

    suggestButton.addEventListener("click", function () {
      onSelectBook(book, selectionMessage, suggestButton);
    });

    bookInfo.append(title, author, year, suggestButton, selectionMessage);

    cardBody.appendChild(bookInfo);
    card.appendChild(cardBody);
    resultsContainer.appendChild(card);
  });
}

export function renderClubSuggestions(suggestions, isAdmin, onChooseBook) {
  const list = document.getElementById("clubSuggestionsList");
  const status = document.getElementById("clubSuggestionsStatus");

  list.replaceChildren();

  if (suggestions.length === 0) {
    status.textContent = "Es wurden noch keine Bücher vorgeschlagen.";
    return;
  }

  status.textContent = "";

  suggestions.forEach(function (book) {
    const card = document.createElement("div");
    card.className = "card mb-3";

    const cardBody = document.createElement("div");
    cardBody.className = "card-body";

    const placeholder = document.createElement("div");
    placeholder.className =
      "rounded float-start me-3 mb-2 bg-body-secondary d-flex align-items-center justify-content-center text-secondary text-center";
    placeholder.style.width = "100px";
    placeholder.style.height = "150px";
    placeholder.textContent = "Kein Cover";

    const coverIsbn = String(book.isbn || "").replace(/[^0-9X]/gi, "");

    if (coverIsbn) {
      const cover = document.createElement("img");
      cover.src = `https://covers.openlibrary.org/b/isbn/${coverIsbn}-M.jpg?default=false`;
      cover.alt = `Cover von ${book.title}`;
      cover.className = "rounded float-start me-3 mb-2";
      cover.style.width = "100px";
      cover.style.height = "150px";
      cover.style.objectFit = "cover";
      cover.loading = "lazy";

      cover.addEventListener("error", function () {
        cover.replaceWith(placeholder);
      });

      cardBody.appendChild(cover);
    } else {
      cardBody.appendChild(placeholder);
    }

    const title = document.createElement("h3");
    title.className = "h5";
    title.textContent = book.title || "Unbekannter Titel";

    const author = document.createElement("p");
    author.className = "mb-1";
    author.textContent = `Autor: ${book.author || "Unbekannt"}`;

    const isbn = document.createElement("p");
    isbn.className = "mb-1";
    isbn.textContent = `ISBN: ${book.isbn || "Unbekannt"}`;

    const details = document.createElement("p");
    details.className = "text-secondary mb-1";
    details.textContent = `Seiten: ${book.pages ?? "Unbekannt"} · Erstveröffentlichung: ${book.first_publish_year ?? "Unbekannt"}`;

    const suggestedBy = document.createElement("p");
    suggestedBy.className = "mb-1";
    suggestedBy.textContent = `Vorgeschlagen von: ${book.suggested_by || "Unbekannt"}`;

    const proposalStatus = document.createElement("p");
    proposalStatus.className = "text-secondary mb-0";

    const statusLabels = {
      PENDING: "Wird geprüft",
      READY: "Bereit",
      REJECTED: "Abgelehnt",
    };

    proposalStatus.textContent = `Status: ${statusLabels[book.suggestion_status] || book.suggestion_status || "Unbekannt"}`;

    cardBody.append(title, author, isbn, details, suggestedBy, proposalStatus);
    if (isAdmin && book.suggestion_status === "READY") {
      const selectButton = document.createElement("button");
      selectButton.type = "button";
      selectButton.className = "btn btn-confirm mt-3";
      selectButton.textContent = "Als nächstes Buch auswählen";

      selectButton.addEventListener("click", function () {
        onChooseBook(book, selectButton);
      });

      cardBody.appendChild(selectButton);
    }
    card.appendChild(cardBody);
    list.appendChild(card);
  });
}
export function renderCurrentBook(book) {
  document.getElementById("title").textContent = book.title;

  const bookData = document.getElementById("currentBookData");

  bookData.textContent =
    `Autor: ${book.author || "Unbekannt"} · ` +
    `ISBN: ${book.isbn || "Unbekannt"} · ` +
    `Seiten: ${book.pages ?? "Unbekannt"}`;

  const cover = document.getElementById("bookCover");
  const isbn = String(book.isbn || "").replace(/[^0-9X]/gi, "");

  cover.classList.add("d-none");

  if (isbn) {
    cover.onload = function () {
      cover.classList.remove("d-none");
    };

    cover.onerror = function () {
      cover.classList.add("d-none");
    };

    cover.alt = `Cover von ${book.title}`;
    cover.src = `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg?default=false`;
  } else {
    cover.removeAttribute("src");
  }

  document.querySelector(".club-name").classList.remove("d-none");
  document.getElementById("clubDescription").classList.add("d-none");
  bookData.classList.remove("d-none");
}

function meetingModel(raw) {
  if (!raw || raw.id == null || !raw.title || !raw.starts_at) {
    throw new Error("MeetingResponse: id, title oder starts_at fehlt.");
  }
  // MeetingResponse
  const ownStatus = raw.my_attendance_status;
  return {
    id: raw.id,
    title: raw.title,
    description: raw.description,
    startsAt: raw.starts_at,
    endsAt: raw.ends_at,
    location: raw.location,
    ownStatus: ["OPEN", "ACCEPTED", "DECLINED"].includes(ownStatus)
      ? ownStatus
      : null,
  };
}

function overviewEntries(raw) {
  //AttendanceOverviewResponse
  const entries = Array.isArray(raw) ? raw : raw?.attendees;
  if (!Array.isArray(entries)) {
    throw new Error("AttendanceOverviewResponse: attendees-Liste fehlt.");
  }
  return entries.map((entry) => {
    if (
      typeof entry.username !== "string" ||
      !["OPEN", "ACCEPTED", "DECLINED"].includes(entry.status)
    ) {
      throw new Error(
        "AttendanceOverviewResponse: Benutzer oder Status fehlt.",
      );
    }
    return entry;
  });
}

function formatMeetingDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Ungültiger Termin"
    : new Intl.DateTimeFormat("de-DE", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(date);
}

export function renderAttendanceOverview(container, raw) {
  const entries = overviewEntries(raw);
  container.replaceChildren();
  for (const [status, label] of [
    ["ACCEPTED", "Zugesagt"],
    ["DECLINED", "Abgesagt"],
    ["OPEN", "Noch offen"],
  ]) {
    const people = entries.filter((entry) => entry.status === status);
    const heading = document.createElement("h4");
    heading.className = "h6 mt-3";
    heading.textContent = `${label} (${people.length})`;
    const list = document.createElement("ul");
    list.className = "mb-1";
    if (people.length === 0) {
      const empty = document.createElement("li");
      empty.textContent = "Niemand";
      list.append(empty);
    }
    for (const person of people) {
      const item = document.createElement("li");
      item.textContent = person.username;
      list.append(item);
    }
    container.append(heading, list);
  }
}

export function renderMeetings(rawMeetings, isAdmin, onAttend, onOverview) {
  if (!Array.isArray(rawMeetings)) {
    throw new Error("Die Meeting-API hat keine Liste zurückgegeben.");
  }
  const list = document.getElementById("meetingList");
  list.replaceChildren();
  // Serverseitig standardmäßig nur kommende Termine vorgesehen
  // zusätzliche Filter schützt Anzeige, falls API alte Termine liefert
  const meetings = rawMeetings
    .map(meetingModel)
    .filter((meeting) => new Date(meeting.startsAt).getTime() > Date.now())
    .sort((a, b) => new Date(a.startsAt) - new Date(b.startsAt));

  if (meetings.length === 0) {
    list.textContent = "Es sind keine zukünftigen Treffen geplant.";
    return;
  }

  for (const meeting of meetings) {
    const card = document.createElement("article");
    card.className = "card p-3 mb-3";
    const title = document.createElement("h3");
    title.className = "h5";
    title.textContent = meeting.title;
    const when = document.createElement("p");
    when.className = "mb-1";
    when.textContent =
      `Beginn: ${formatMeetingDate(meeting.startsAt)}` +
      (meeting.endsAt ? ` · Ende: ${formatMeetingDate(meeting.endsAt)}` : "");
    const location = document.createElement("p");
    location.className = "mb-1";
    location.textContent = `Ort: ${meeting.location || "Nicht angegeben"}`;
    const description = document.createElement("p");
    description.className = "mb-2";
    description.textContent = meeting.description || "Keine Beschreibung.";
    const status = document.createElement("p");
    status.className = "mb-2";
    status.textContent = `Deine Antwort: ${
      {
        OPEN: "Noch offen",
        ACCEPTED: "Zugesagt",
        DECLINED: "Abgesagt",
      }[meeting.ownStatus] || "Nicht verfügbar"
    }`;
    const feedback = document.createElement("p");
    feedback.className = "mb-0";
    feedback.setAttribute("role", "status");
    card.append(title, when, location, description, status);

    if (meeting.ownStatus === "OPEN") {
      const actions = document.createElement("div");
      actions.className = "d-flex flex-wrap gap-2 mb-2";
      const buttons = [
        ["ACCEPTED", "Zusagen", "btn-confirm"],
        ["DECLINED", "Absagen", "btn-reject"],
      ].map(([answer, text, style]) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = `btn ${style}`;
        button.textContent = text;
        button.addEventListener("click", async () => {
          for (const item of buttons) item.disabled = true;
          feedback.textContent = "Antwort wird gespeichert...";
          try {
            await onAttend(meeting.id, answer);
            meeting.ownStatus = answer;
            status.textContent = `Deine Antwort: ${
              answer === "ACCEPTED" ? "Zugesagt" : "Abgesagt"
            }`;
            actions.remove();
            feedback.textContent = "Antwort gespeichert.";
          } catch (error) {
            feedback.textContent = error.message;
            for (const item of buttons) item.disabled = false;
          }
        });
        actions.append(button);
        return button;
      });
      card.append(actions);
    }

    if (isAdmin) {
      const overviewButton = document.createElement("button");
      overviewButton.type = "button";
      overviewButton.className = "btn btn-outline-secondary align-self-start";
      overviewButton.textContent = "Antworten anzeigen";
      const overview = document.createElement("div");
      overviewButton.addEventListener("click", async () => {
        overviewButton.disabled = true;
        overview.textContent = "Antworten werden geladen...";
        try {
          const data = await onOverview(meeting.id);
          renderAttendanceOverview(overview, data);
        } catch (error) {
          overview.textContent = error.message;
        } finally {
          overviewButton.disabled = false;
        }
      });
      card.append(overviewButton, overview);
    }
    card.append(feedback);
    list.append(card);
  }
}
