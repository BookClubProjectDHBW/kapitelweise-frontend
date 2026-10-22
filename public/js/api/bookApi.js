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
