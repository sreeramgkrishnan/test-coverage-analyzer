const store = new Map<string, Record<string, any>>();

export const metadataStore = {
  set: (id: string, data: Record<string, any>) => store.set(id, data),
  get: (id: string) => store.get(id),
  all: () => Array.from(store.entries()).map(([k,v])=>({id:k, data:v})),
  clear: () => store.clear()
}
// src/data/metadataStore.ts
// This file is intentionally left blank.