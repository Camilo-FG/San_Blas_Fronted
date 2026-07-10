import type { CatequesisEnrollmentRecord } from "../../modules/dashboard/catequesis/Types/catequesis";
import type { CrearInscripcionBackendRequest } from "./catequesisApiTypes";
import { DEMO_CATEQUESIS_RECORDS } from "./catequesisDemoData";

const DB_NAME = "sanblas-catequesis-offline";
const DB_VERSION = 1;
const OFFLINE_ID_KEY = "catequesis-offline-next-id";
const DEMO_SEEDED_KEY = "catequesis-demo-seeded";

export interface PendingCatequesisSubmission {
  localId: number;
  createdAt: string;
  backendPayload: CrearInscripcionBackendRequest;
  record: CatequesisEnrollmentRecord;
  feBautismoBlob?: Blob;
  feBautismoName?: string;
  feBautismoType?: string;
  comprobanteBlob?: Blob;
  comprobanteName?: string;
  comprobanteType?: string;
}

interface ListCacheEntry {
  key: string;
  updatedAt: string;
  records: CatequesisEnrollmentRecord[];
}

const openDatabase = (): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains("pending")) {
        db.createObjectStore("pending", { keyPath: "localId" });
      }

      if (!db.objectStoreNames.contains("listCache")) {
        db.createObjectStore("listCache", { keyPath: "key" });
      }

      if (!db.objectStoreNames.contains("details")) {
        db.createObjectStore("details", { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

const runTransaction = async <T>(
  storeName: string,
  mode: IDBTransactionMode,
  action: (store: IDBObjectStore) => IDBRequest<T> | void,
): Promise<T | void> => {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, mode);
    const store = transaction.objectStore(storeName);
    const request = action(store);

    transaction.oncomplete = () => {
      if (request instanceof IDBRequest) {
        resolve(request.result);
      } else {
        resolve();
      }
    };

    transaction.onerror = () => reject(transaction.error);
  });
};

export const getNextOfflineId = (): number => {
  const stored = localStorage.getItem(OFFLINE_ID_KEY);
  const current = stored ? Number.parseInt(stored, 10) : 0;
  const next = current > 0 ? -1 : current - 1;
  localStorage.setItem(OFFLINE_ID_KEY, String(next));
  return next;
};

export const savePendingSubmission = async (
  submission: PendingCatequesisSubmission,
): Promise<void> => {
  await runTransaction("pending", "readwrite", (store) =>
    store.put(submission),
  );
};

export const getPendingSubmissions = async (): Promise<
  PendingCatequesisSubmission[]
> => {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction("pending", "readonly");
    const store = transaction.objectStore("pending");
    const request = store.getAll();

    request.onsuccess = () => {
      resolve((request.result as PendingCatequesisSubmission[]) ?? []);
    };

    request.onerror = () => reject(request.error);
  });
};

export const removePendingSubmission = async (localId: number): Promise<void> => {
  await runTransaction("pending", "readwrite", (store) => store.delete(localId));
};

export const saveListCache = async (
  records: CatequesisEnrollmentRecord[],
  estado?: string,
): Promise<void> => {
  const entry: ListCacheEntry = {
    key: estado ?? "all",
    updatedAt: new Date().toISOString(),
    records,
  };

  await runTransaction("listCache", "readwrite", (store) => store.put(entry));
};

export const getListCache = async (
  estado?: string,
): Promise<CatequesisEnrollmentRecord[]> => {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction("listCache", "readonly");
    const store = transaction.objectStore("listCache");
    const request = store.get(estado ?? "all");

    request.onsuccess = () => {
      const entry = request.result as ListCacheEntry | undefined;
      resolve(entry?.records ?? []);
    };

    request.onerror = () => reject(request.error);
  });
};

export const saveDetailCache = async (
  record: CatequesisEnrollmentRecord,
): Promise<void> => {
  await runTransaction("details", "readwrite", (store) =>
    store.put({ id: record.id, record }),
  );
};

export const getDetailCache = async (
  id: number,
): Promise<CatequesisEnrollmentRecord | null> => {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction("details", "readonly");
    const store = transaction.objectStore("details");
    const request = store.get(id);

    request.onsuccess = () => {
      const entry = request.result as { id: number; record: CatequesisEnrollmentRecord } | undefined;
      resolve(entry?.record ?? null);
    };

    request.onerror = () => reject(request.error);
  });
};

export const isOfflineId = (id: number): boolean => id < 0;

export const ensureOfflineDemoData = async (): Promise<void> => {
  if (localStorage.getItem(DEMO_SEEDED_KEY) === "true") {
    return;
  }

  const pending = await getPendingSubmissions();
  const cached = await getListCache();

  if (pending.length > 0 || cached.length > 0) {
    localStorage.setItem(DEMO_SEEDED_KEY, "true");
    return;
  }

  for (const record of DEMO_CATEQUESIS_RECORDS) {
    await saveDetailCache(record);
  }

  await saveListCache(DEMO_CATEQUESIS_RECORDS);
  localStorage.setItem(DEMO_SEEDED_KEY, "true");
};
