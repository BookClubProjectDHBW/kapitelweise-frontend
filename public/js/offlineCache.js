const OFFLINE_DB_NAME = "kapitelweiseHome";
const OFFLINE_API_CACHE = "kapitelweise-api";
export const OFFLINE_CLUB_KEY = "offlineClub-";

export async function clearOfflineCache() {
  Object.keys(localStorage)
    .filter((key) => key.startsWith(OFFLINE_CLUB_KEY))
    .forEach((key) => localStorage.removeItem(key));

  if ("caches" in window) {
    await caches.delete(OFFLINE_API_CACHE);
  }

  return new Promise((resolve) => {
    const request = window.indexedDB.deleteDatabase(OFFLINE_DB_NAME);
    request.onsuccess = () => resolve();
    request.onerror = () => {
      console.error("Offline-Cache konnte nicht gelöscht werden:", request.error);
      resolve();
    };
    request.onblocked = () => resolve();
  });
}
