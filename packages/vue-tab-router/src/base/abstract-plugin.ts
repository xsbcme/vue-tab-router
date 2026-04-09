import { Plugin } from "./plugin";

export abstract class AbstractPlugin {
    protected _isLoad: boolean = false;

    protected abstract onLoad(plugin: Plugin): void;
    protected abstract onDestroy(): void;

}