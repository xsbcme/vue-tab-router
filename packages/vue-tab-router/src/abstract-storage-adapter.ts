export abstract class AbstractStorageAdapter {
  public abstract get<T = any>(key: string, def?: T): T;
  public abstract set<T = any>(key: string, val: T): this;
  public abstract del(key: string): this;
}
