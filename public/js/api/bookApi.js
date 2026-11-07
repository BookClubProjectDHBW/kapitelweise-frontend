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
    `${config.api.backend}/clubs/${encodeURIComponent(clubId)}/suggestions`,
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
    const errorData = await response.json().catch(() => null);

    throw new Error(
      errorData?.message ||
        `Buchvorschlag fehlgeschlagen (HTTP ${response.status}).`,
    );
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
    const errorData = await response.json().catch(() => null);

    const error = new Error(
      errorData?.message ||
        `Buchvorschläge konnten nicht geladen werden (HTTP ${response.status}).`,
    );
    if (response.status === 403) {
      error.code = "FORBIDDEN";
    }
    throw error;
  }

  return response.json();
}

export async function setCurrentBook(clubId, proposalId) {
  const response = await fetch(
    `${config.api.backend}/clubs/${encodeURIComponent(clubId)}/current-book/${encodeURIComponent(proposalId)}`,
    {
      method: "POST",
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
    const errorData = await response.json().catch(() => null);

    throw new Error(
      errorData?.message ||
        `Buchauswahl fehlgeschlagen (HTTP ${response.status}).`,
    );
  }

  return response.json();
}
export async function getCurrentBook(clubId) {
  const response = await fetch(
    `${config.api.backend}/clubs/${encodeURIComponent(clubId)}/current-book`,
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

  if (response.status === 409) {
    return null;
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);

    throw new Error(
      errorData?.message ||
        `Aktuelles Buch konnte nicht geladen werden (HTTP ${response.status}).`,
    );
  }

  return response.json();
}

export async function finishCurrentBook(clubId) {
  const response = await fetch(
    `${config.api.backend}/clubs/${encodeURIComponent(clubId)}/close-book`,
    {
      method: "PATCH",
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
    const errorData = await response.json().catch(() => null);

    throw new Error(
      errorData?.message ||
        `Buch konnte nicht abgeschlossen werden (HTTP ${response.status}).`,
    );
  }
}
