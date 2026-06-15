export abstract class AbstractStorageAdapter {
  public abstract get<T = unknown>(key: string, def?: T): T;
  public abstract set<T = unknown>(key: string, val: T): this;
  public abstract del(key: string): this;
}
