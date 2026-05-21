import { AbstractPlugin } from "./base/abstract-plugin";
import { TabsManager } from "./tabs-manager";

export abstract class AbstractTabsManagerPlugin extends AbstractPlugin {
  protected abstract onLoad(tabsManager: TabsManager): void;
}
