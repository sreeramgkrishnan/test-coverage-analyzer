type CoverageRecord = {
  id: string;
  result: any;
}

const store = new Map<string, CoverageRecord>();

export const coverageStore = {
  set: (id: string, result: any) => store.set(id, { id, result }),
  get: (id: string) => store.get(id)?.result,
  all: () => Array.from(store.values()).map(r=>r.result),
  clear: () => store.clear()
}
// This file is intentionally left blank.