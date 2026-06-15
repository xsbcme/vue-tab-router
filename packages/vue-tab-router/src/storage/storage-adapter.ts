import { AbstractStorageAdapter } from "./storage-adapter-base";

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

class MemoryStorage implements StorageLike {
  private readonly data = new Map<string, string>();

  getItem(key: string) {
    return this.data.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.data.set(key, value);
  }

  removeItem(key: string) {
    this.data.delete(key);
  }
}

function getDefaultStorage(): StorageLike {
  try {
    return typeof sessionStorage === "undefined" ? new MemoryStorage() : sessionStorage;
  } catch (error) {
    return new MemoryStorage();
  }
}

export class StorageAdapter extends AbstractStorageAdapter {
  constructor(private readonly storage: StorageLike = getDefaultStorage()) {
    super();
  }

  get<T = unknown>(key: string, def?: T): T {
    const val = this.storage.getItem(key);
    if (val === null) return def as T;
    try {
      return JSON.parse(val);
    } catch (error) {
      return def as T;
    }
  }

  set<T = unknown>(key: string, val: T): this {
    this.storage.setItem(key, JSON.stringify(val));
    return this;
  }

  del(key: string): this {
    this.storage.removeItem(key);
    return this;
  }
}
