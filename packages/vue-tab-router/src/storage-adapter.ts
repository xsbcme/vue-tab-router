import { AbstractStorageAdapter } from "./abstract-storage-adapter";

export class StorageAdapter extends AbstractStorageAdapter {
  constructor(private readonly storage = sessionStorage) {
    super();
  }

  get<T = any>(key: string, def?: T): T {
    const val = this.storage.getItem(key);
    if (!val) return def as T;
    try {
      return JSON.parse(val);
    } catch (error) {
      return def as T;
    }
  }

  set<T = any>(key: string, val: T): this {
    this.storage.setItem(key, JSON.stringify(val));
    return this;
  }

  del(key: string): this {
    this.storage.removeItem(key);
    return this;
  }
}
