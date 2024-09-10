export class Singleton {
    private static _instance: Singleton | null = null;
    protected constructor() { }
    static getInstance<T extends Singleton>() {
        if (!this._instance) {
            this._instance = new this();
        }
        return this._instance as T;
    }

}