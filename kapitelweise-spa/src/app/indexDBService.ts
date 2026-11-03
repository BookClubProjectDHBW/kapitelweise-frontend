import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class IndexedDBService {
  private dbName = 'kapitelweiseHome';
  private storeName = 'member';
  private dbPromise: Promise<IDBDatabase> | null = null;

  private getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) {
      return this.dbPromise;
    }

    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, {
            keyPath: 'id',
            autoIncrement: true,
          });
        }
      };

      request.onsuccess = (event: Event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        resolve(db);
      };

      request.onerror = (event: Event) => {
        const error = (event.target as IDBOpenDBRequest).error;
        console.error('Fehler beim Initialisieren der IndexedDB:', error);
        reject(error);
      };
    });

    return this.dbPromise;
  }

  async setCache<T>(key: string, data: T): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const record = { id: key, payload: data, updatedAt: Date.now() };
      const request = store.put(record);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Mit Hilfe der KI entwickelt (Rückgabe von updatedAt)
  async getCache<T>(key: string): Promise<{ payload: T; updatedAt: number } | null> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(key);

      request.onsuccess = () => {
        if (request.result && request.result.payload) {
          resolve({ payload: request.result.payload as T, updatedAt: request.result.updatedAt });
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  async deleteData(id: number | string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}
