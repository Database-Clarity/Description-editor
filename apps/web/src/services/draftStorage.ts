import { tooltipSchema } from '@clarity/core';
import { z } from 'zod';

export const draftsSchema = z
  .record(
    z.string(),
    z.object({
      base: tooltipSchema,
      next: tooltipSchema,
    }),
  )
  .refine(
    (drafts) =>
      Object.entries(drafts).every(
        ([key, { base, next }]) => key === String(base.hash) && base.hash === next.hash,
      ),
    'Draft keys and tooltip hashes must match',
  );
export type Drafts = z.infer<typeof draftsSchema>;
export interface DraftStorage {
  read(): Promise<Drafts>;
  write(drafts: Drafts): Promise<void>;
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('clarity-editor-v2', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('drafts');
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onblocked = () =>
      reject(new Error('Draft storage upgrade blocked. Close other editor tabs.'));
  });
}

export function createIndexedDbStorage(): DraftStorage {
  let expected: string | undefined;
  return {
    async read() {
      const db = await openDatabase();
      try {
        return await new Promise<Drafts>((resolve, reject) => {
          const transaction = db.transaction('drafts', 'readonly');
          const request = transaction.objectStore('drafts').get('tooltips');
          transaction.oncomplete = () => {
            const parsed = draftsSchema.safeParse(request.result ?? {});
            if (parsed.success) {
              expected = JSON.stringify(request.result ?? {});
              resolve(parsed.data);
            } else reject(new Error(`Stored drafts are invalid: ${parsed.error.message}`));
          };
          transaction.onabort = () => reject(transaction.error ?? new Error('Draft read aborted'));
          transaction.onerror = () => reject(transaction.error);
        });
      } finally {
        db.close();
      }
    },
    async write(drafts) {
      const db = await openDatabase();
      try {
        await new Promise<void>((resolve, reject) => {
          const transaction = db.transaction('drafts', 'readwrite');
          const store = transaction.objectStore('drafts');
          const request = store.get('tooltips');
          let conflict = false;
          request.onsuccess = () => {
            if (expected === undefined || JSON.stringify(request.result ?? {}) !== expected) {
              conflict = true;
              transaction.abort();
              return;
            }
            store.put(drafts, 'tooltips');
          };
          transaction.oncomplete = () => {
            expected = JSON.stringify(drafts);
            resolve();
          };
          transaction.onabort = () =>
            reject(
              conflict
                ? new Error(
                    'Another tab changed local drafts. Keep this tab open; recover the other tab before reloading.',
                  )
                : (transaction.error ?? new Error('Draft write aborted')),
            );
          transaction.onerror = () => reject(transaction.error);
        });
      } finally {
        db.close();
      }
    },
  };
}

export const draftStorage = createIndexedDbStorage();
