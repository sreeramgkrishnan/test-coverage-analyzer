type EmbeddingRecord = {
  id: string;
  vector: number[];
  metadata?: Record<string, any>;
}

const store = new Map<string, EmbeddingRecord>();

export const embeddingsStore = {
  upsert: (id: string, vector: number[], metadata?: Record<string, any>) => {
    store.set(id, { id, vector, metadata });
  },
  getAll: () => Array.from(store.values()),
  get: (id: string) => store.get(id),
  clear: () => store.clear()
}
// This file is intentionally left blank.