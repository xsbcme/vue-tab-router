import { toRaw } from "vue";
import { AbstractStorageAdapter } from "../storage/storage-adapter-base";
import { STORAGE_TABS_KEY } from "../shared/constant";
import { StorageAdapter } from "../storage/storage-adapter";
import type { ITabsManagerOptions } from "../types";

export class TabsPersistence {
  private storageAdapter: AbstractStorageAdapter | null;
  private storageKey: string;
  private suspendCount = 0;
  private pending = false;

  public constructor(options: ITabsManagerOptions) {
    const storageEnabled = options.storageEnabled !== false;
    this.storageKey = options.storageKey || STORAGE_TABS_KEY;
    this.storageAdapter = storageEnabled ? (options.storageAdapter ?? new StorageAdapter()) : null;
  }

  get storage() {
    return this.storageAdapter;
  }

  public restore<T>(def: T): T {
    return this.storage?.get<T>(this.storageKey, def) ?? def;
  }

  public persist<T>(value: T) {
    if (this.suspendCount > 0) {
      this.pending = true;
      return;
    }
    this.storage?.set(this.storageKey, toRaw(value));
  }

  public async defer<T>(runner: () => Promise<T>, flush: () => void) {
    this.suspendCount++;
    try {
      return await runner();
    } finally {
      this.suspendCount--;
      if (this.suspendCount === 0 && this.pending) {
        this.pending = false;
        flush();
      }
    }
  }

  public clear() {
    this.pending = false;
    this.storage?.del(this.storageKey);
  }
}
