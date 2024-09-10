import { AbstractPlugin } from "./abstract-plugin";

export class Plugin {
    private _plugins: AbstractPlugin[] = [];

    public addPlugin<T extends AbstractPlugin>(plugin: T) {
        if (!this.getPlugin(Reflect.get(plugin as AbstractPlugin, 'constructor'))) {
            this._plugins.push(plugin);
        }
        return this;
    }

    public getPlugin<T extends new (...args: any[]) => AbstractPlugin>(clazz: T) {
        return this._plugins.find(plugin => Reflect.get(plugin, 'constructor').name === clazz.name) as InstanceType<T>;
    }

    public delPlugin<T extends new (...args: any[]) => AbstractPlugin>(clazz: T) {
        const index = this._plugins.findIndex(plugin => Reflect.get(plugin, 'constructor').name === clazz.name);
        if (index >= 0) {
            const plugin = this._plugins[index];
            const onDestroy = Reflect.get(plugin, 'onDestroy');
            onDestroy && onDestroy.call(plugin);
            Reflect.set(plugin, '_isLoad', false);
            this._plugins.splice(index, 1);
        }
        return this;
    }

    protected clearPlugin() {
        this._plugins.forEach(plugin => {
            this.delPlugin(Reflect.get(plugin, 'constructor'));
        });
    }

    protected loadPlugin() {
        this._plugins.forEach(plugin => {
            if (!Reflect.get(plugin, '_isLoad')) {
                const onLoad = Reflect.get(plugin, 'onLoad');
                onLoad && onLoad.call(plugin, this);
                Reflect.set(plugin, '_isLoad', true);
            }
        });
    }

}