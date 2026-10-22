import { config } from "../config.js";

export async function searchBooks(searchType, searchTerm, signal) {
  const searchParams = new URLSearchParams({
    [searchType]: searchTerm,
  });

  const response = await fetch(
    `${config.api.bookSearch}/book-search?${searchParams}`,
    {
      signal,
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error(`HTTP-Fehler: ${response.status}`);
  }

  return response.json();
}

export async function submitBookProposal(clubId, book) {
  if (!book.isbn || !book.title) {
    throw new Error("Für diesen Buchvorschlag fehlen Titel oder ISBN.");
  }

  const proposal = {
    title: book.title,
    isbn: book.isbn,
    pages: Number.isInteger(book.pages) ? book.pages : null,
    author: book.author ?? null,
    firstPublishYear: Number.isInteger(book.firstPublishYear)
      ? book.firstPublishYear
      : null,
  };

  const response = await fetch(
    `${config.api.backend}/clubs/${encodeURIComponent(clubId)}/proposals`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
      body: JSON.stringify(proposal),
    },
  );

  if (response.status === 401) {
    sessionStorage.removeItem("token");
    window.location.href = "loginPage.html";
    throw new Error("Deine Anmeldung ist abgelaufen.");
  }

  if (!response.ok) {
    throw new Error(`Buchvorschlag fehlgeschlagen (HTTP ${response.status}).`);
  }

  return response.json();
}

export async function getClubSuggestions(clubId) {
  const response = await fetch(
    `${config.api.backend}/clubs/${encodeURIComponent(clubId)}/suggestions`,
    {
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
    },
  );

  if (response.status === 401) {
    sessionStorage.removeItem("token");
    window.location.href = "loginPage.html";
    throw new Error("Deine Anmeldung ist abgelaufen.");
  }

  if (!response.ok) {
    throw new Error(`HTTP-Fehler: ${response.status}`);
  }

  return response.json();
}
