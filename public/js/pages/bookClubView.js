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
    clubDescription.textContent = club.description || "Keine Beschreibung vorhanden.";
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

    if (book.cover_i) {
      const cover = document.createElement("img");
      cover.src = `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`;
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
    selectionMessage.className = "book-selection-message text-secondary mt-2 mb-0";

    suggestButton.addEventListener("click", function () {
      onSelectBook(book, selectionMessage);
    });

    bookInfo.append(title, author, year, suggestButton, selectionMessage);
    cardBody.appendChild(bookInfo);
    card.appendChild(cardBody);
    resultsContainer.appendChild(card);
  });
}