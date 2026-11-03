const OFFLINE_DB_NAME = "kapitelweiseHome";

export function clearOfflineCache() {
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
