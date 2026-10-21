
import { config } from "../config.js";

export async function searchBooks(searchType, searchTerm, signal) {
  const searchParams = new URLSearchParams({
    [searchType]: searchTerm,
  });

  const response = await fetch(
    `${config.api.bookSearch}/bookSearch?${searchParams}`,
    {
      signal: signal,
    },
  );

  if (!response.ok) {
    throw new Error(`HTTP-Fehler: ${response.status}`);
  }

  return await response.json();
}
