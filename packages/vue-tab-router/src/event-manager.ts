interface IFunction {
  func: Function;
  ctx?: unknown;
}

export class EventManager {
  private static _instance: EventManager | null = null;

  private constructor() {}

  private events: Map<string, Array<IFunction>> = new Map();

  get eventNames() {
    return Array.from(this.events.keys());
  }

  on(eventName: string, func: Function, ctx?: unknown) {
    if (this.events.has(eventName)) {
      this.events.get(eventName)!.push({ func, ctx });
    } else {
      this.events.set(eventName, [{ func, ctx }]);
    }
  }

  off(eventName: string, func?: Function) {
    if (this.events.has(eventName)) {
      if (func) {
        const index = this.events.get(eventName)!.findIndex(item => item.func === func);
        index > -1 && this.events.get(eventName)!.splice(index, 1);
      } else {
        this.events.delete(eventName);
      }
    }
  }

  emit(eventName: string, ...args: unknown[]) {
    if (this.events.has(eventName)) {
      this.events.get(eventName)!.forEach(({ func, ctx }) => {
        ctx ? func.apply(ctx, args) : func(...args);
      });
    }
  }

  clear() {
    this.events.clear();
  }

  static getInstance(): EventManager {
    if (!this._instance) {
      this._instance = new EventManager();
    }
    return this._instance;
  }
}
