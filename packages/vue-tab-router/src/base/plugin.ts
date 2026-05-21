import { AbstractPlugin } from "./abstract-plugin";

export class Plugin {
  private _plugins: AbstractPlugin[] = [];

  public addPlugin<T extends AbstractPlugin>(plugin: T) {
    if (!this.getPlugin(plugin.constructor as new (...args: any[]) => AbstractPlugin)) {
      this._plugins.push(plugin);
    }
    return this;
  }

  public getPlugin<T extends new (...args: any[]) => AbstractPlugin>(clazz: T) {
    return this._plugins.find(plugin => plugin.constructor.name === clazz.name) as InstanceType<T>;
  }

  public delPlugin<T extends new (...args: any[]) => AbstractPlugin>(clazz: T) {
    const index = this._plugins.findIndex(plugin => plugin.constructor.name === clazz.name);
    if (index >= 0) {
      const plugin = this._plugins[index] as any;
      plugin.onDestroy?.();
      plugin._isLoad = false;
      this._plugins.splice(index, 1);
    }
    return this;
  }

  protected clearPlugin() {
    this._plugins.forEach(plugin => {
      this.delPlugin(plugin.constructor as new (...args: any[]) => AbstractPlugin);
    });
  }

  protected loadPlugin() {
    this._plugins.forEach(plugin => {
      const p = plugin as any;
      if (!p._isLoad) {
        p.onLoad(this);
        p._isLoad = true;
      }
    });
  }
}
