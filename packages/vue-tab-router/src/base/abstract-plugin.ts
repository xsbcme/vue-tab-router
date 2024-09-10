import { Plugin } from "./plugin";

export abstract class AbstractPlugin {
    //@ts-ignore
    private _isLoad: boolean = false;

    protected abstract onLoad(plugin: Plugin): void;
    protected abstract onDestroy(): void;

}