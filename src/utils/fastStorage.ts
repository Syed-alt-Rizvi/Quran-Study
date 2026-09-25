// Ultra-fast asynchronous IndexedDB storage layer with in-memory L1 cache and fallback

const DB_NAME = 'shia_markaz_fast_cache';
const DB_VERSION = 1;
const STORE_NAME = 'kv_store';

let dbPromise: Promise<IDBDatabase> | null = null;
const memoryL1 = new Map<string, any>();

function getDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB not available'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });

  return dbPromise;
}

export const fastStorage = {
  async get<T = any>(key: string): Promise<T | null> {
    // Check Tier 1: In-memory L1 Cache (0ms)
    if (memoryL1.has(key)) {
      return memoryL1.get(key) as T;
    }

    // Check Tier 2: IndexedDB
    try {
      const db = await getDb();
      return new Promise<T | null>((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(key);

        req.onsuccess = () => {
          const val = req.result !== undefined ? req.result : null;
          if (val !== null) {
            memoryL1.set(key, val);
          }
          resolve(val);
        };

        req.onerror = () => {
          resolve(null);
        };
      });
    } catch {
      // Fallback: localStorage
      try {
        const item = localStorage.getItem(key);
        if (item) {
          const parsed = JSON.parse(item);
          memoryL1.set(key, parsed);
          return parsed;
        }
      } catch {}
      return null;
    }
  },

  async set(key: string, value: any): Promise<void> {
    // Store in Tier 1 L1
    memoryL1.set(key, value);

    // Store in Tier 2 IndexedDB asynchronously (non-blocking)
    try {
      const db = await getDb();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.put(value, key);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {
      // Fallback: localStorage (with size check)
      try {
        const str = JSON.stringify(value);
        if (str.length < 500000) { // Only small items in localStorage fallback to avoid quota error
          localStorage.setItem(key, str);
        }
      } catch {}
    }
  },

  async del(key: string): Promise<void> {
    memoryL1.delete(key);
    try {
      const db = await getDb();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).delete(key);
    } catch {
      try { localStorage.removeItem(key); } catch {}
    }
  }
};
