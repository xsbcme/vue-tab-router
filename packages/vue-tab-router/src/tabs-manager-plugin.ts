import type { App } from "vue";
import type { IframeLoadEvent, IframeMessageEvent } from "./iframe-message";
import type { Tab } from "./tab";
import type { TabsManager } from "./tabs-manager";
import { TabGuardRejectError } from "./tab-guard";

export type TabsManagerHookReturn = void | boolean | Promise<void | boolean>;

/** TabsManager 插件可监听的生命周期 hook 参数映射。 */
export interface TabsManagerHookMap {
  /** 打开 tab 前触发。返回 false 可阻止打开。 */
  "tab:before-open": [openingTab: Partial<Tab>, sourceTab?: Partial<Tab>];
  /** tab 已打开后触发。 */
  "tab:opened": [openedTab: Partial<Tab>, sourceTab?: Partial<Tab>];
  /** 激活 tab 切换前触发。返回 false 可阻止切换。 */
  "tab:before-active-change": [toTab: Partial<Tab>, fromTab?: Partial<Tab>];
  /** 激活 tab 已切换后触发。 */
  "tab:active-changed": [toTab: Partial<Tab>, fromTab?: Partial<Tab>];
  /** tab 元信息已更新后触发。 */
  "tab:updated": [tab: Partial<Tab>];
  /** 关闭 tab 前触发。返回 false 可阻止关闭。 */
  "tab:before-close": [closingTab: Partial<Tab>, sourceTab?: Partial<Tab>];
  /** tab 已关闭后触发。 */
  "tab:closed": [closedTab: Partial<Tab>, fallbackTab?: Partial<Tab>];
  /** 刷新 tab 前触发。返回 false 可阻止刷新。 */
  "tab:before-refresh": [tab: Partial<Tab>];
  /** tab 已刷新后触发。 */
  "tab:refreshed": [tab: Partial<Tab>];
  /** tab 已进入弹窗显示。 */
  "tab:detached-opened": [tab: Partial<Tab>];
  /** 弹窗显示已关闭。 */
  "tab:detached-closed": [tab?: Partial<Tab>];
  /** 弹窗显示容器渲染失败。 */
  "tab:detached-error": [error: unknown];
  /** iframe 通过 postMessage 向宿主发送消息时触发。 */
  "iframe:message": [message: IframeMessageEvent];
  /** iframe 加载完成时触发。 */
  "iframe:load": [context: IframeLoadEvent];
  /** 全部 tab 状态被清空后触发。 */
  "tabs:cleared": [];
}

export type TabsManagerHookName = keyof TabsManagerHookMap;
export type TabsManagerHookHandler<Name extends TabsManagerHookName> = (
  ...args: TabsManagerHookMap[Name]
) => TabsManagerHookReturn;
type TabsManagerHookHandlerSet = {
  [Name in TabsManagerHookName]?: Set<TabsManagerHookHandler<Name>>;
};
export type TabsManagerPluginCleanup = () => void;

/** 插件 setup 函数接收的上下文。 */
export interface TabsManagerPluginContext {
  /** 当前 Vue 应用实例。 */
  app: App;
  /** 当前 TabsManager 实例。 */
  tabsManager: TabsManager;
  /** 插件 hook 注册器。 */
  hooks: TabsManagerHooks;
  /** 注册插件卸载时的清理函数。 */
  onDispose(cleanup: TabsManagerPluginCleanup): void;
}

/** 插件 setup 函数。返回函数时会作为卸载清理函数执行。 */
export type TabsManagerPluginSetup = (context: TabsManagerPluginContext) => void | TabsManagerPluginCleanup;

/** TabsManager 插件，支持函数形式或对象形式。 */
export type TabsManagerPlugin =
  | TabsManagerPluginSetup
  | {
      /** 插件名称，便于调试或区分插件。 */
      name?: string | symbol;
      /** 插件安装函数。 */
      setup: TabsManagerPluginSetup;
    };

/** 插件 hook 注册与触发管理器。 */
export class TabsManagerHooks {
  private handlers: TabsManagerHookHandlerSet = {};

  private getHandlers<Name extends TabsManagerHookName>(name: Name) {
    return this.handlers[name] as Set<TabsManagerHookHandler<Name>> | undefined;
  }

  private setHandlers<Name extends TabsManagerHookName>(name: Name, handlers: Set<TabsManagerHookHandler<Name>>) {
    Object.assign(this.handlers, { [name]: handlers });
  }

  /** 注册 hook 处理函数，返回取消注册函数。 */
  public on<Name extends TabsManagerHookName>(name: Name, handler: TabsManagerHookHandler<Name>) {
    const handlers = this.getHandlers(name) ?? new Set<TabsManagerHookHandler<Name>>();
    handlers.add(handler);
    this.setHandlers(name, handlers);

    return () => {
      handlers.delete(handler);
      if (!handlers.size) {
        delete this.handlers[name];
      }
    };
  }

  /** 依次触发某个 hook。处理函数返回 false 时会中断流程。 */
  public async call<Name extends TabsManagerHookName>(name: Name, ...args: TabsManagerHookMap[Name]) {
    const handlers = Array.from(this.getHandlers(name) ?? []);
    for (const handler of handlers) {
      const result = await handler(...args);
      if (result === false) {
        throw new TabGuardRejectError(`${String(name)} rejected`);
      }
    }
  }

  /** 清空全部 hook 处理函数。 */
  public clear() {
    this.handlers = {};
  }
}
