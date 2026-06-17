import type { IframeMessageEvent } from "@/iframe/iframe-message";
import { createIframeTabClientResponse, isIframeTabClientRequest } from "@/iframe/iframe-tab-client-protocol";
import { clone } from "@/shared";
import type { Tab } from "@/tabs/tab";
import type { TabsManager } from "@/tabs/tabs-manager";
import type { ITabsManagerOptions } from "@/types";

async function handleIframeTabClientRequest(tabsManager: TabsManager, message: IframeMessageEvent) {
  if (!isIframeTabClientRequest(message.data)) return false;

  const request = message.data;
  const tabId = message.tabId;
  const reply = (ok: boolean, data?: unknown, error?: string) => {
    const response = createIframeTabClientResponse(request, ok, data, error);
    if (message.source && "postMessage" in message.source) {
      (message.source.postMessage as (message: unknown, targetOrigin: string) => void)(response, message.origin);
      return;
    }
    message.reply(response);
  };

  try {
    if (!tabId) throw new Error("当前 iframe 页签不存在");

    switch (request.action) {
      case "tab:get":
        reply(true, clone(tabsManager.getTabById(tabId) || message.tab));
        break;
      case "tab:open": {
        const payload = request.payload || {};
        const viewUrl = payload.viewUrl;
        if (typeof viewUrl !== "string") throw new Error("tab:open 需要传入 viewUrl");
        const openedTabId = await tabsManager.openTab(viewUrl, payload.options as Record<string, unknown> | undefined);
        reply(true, openedTabId);
        break;
      }
      case "tab:refresh":
        await tabsManager.refreshTab(tabId);
        reply(true, true);
        break;
      case "tab:close":
        await tabsManager.closeTab(tabId);
        reply(true, true);
        break;
      case "tab:update":
        await tabsManager.updateTabOptions((request.payload?.options || {}) as Record<string, unknown>, tabId);
        reply(true, true);
        break;
      case "tab:emit": {
        const payload = request.payload || {};
        const eventName = payload.eventName;
        if (typeof eventName !== "string") throw new Error("tab:emit 需要传入 eventName");
        tabsManager.emit(eventName, payload.data, tabId);
        reply(true, true);
        break;
      }
      default:
        throw new Error(`未知 iframe tab client 动作：${request.action}`);
    }
  } catch (error) {
    reply(false, undefined, error instanceof Error ? error.message : String(error));
  }

  return true;
}

export function createIframeMessageDispatcher(tabsManager: TabsManager, managerOptions: ITabsManagerOptions | null) {
  const { onIframeMessage } = managerOptions || {};

  const emitIframeMessage = async (event: MessageEvent, tab: Tab) => {
    const latestTab = tabsManager.getTabById(tab._id) || tab;
    const payload: IframeMessageEvent = {
      data: event.data,
      origin: event.origin,
      source: event.source,
      rawEvent: event,
      tab: clone(latestTab),
      tabId: latestTab._id,
      reply: (data, options = {}) => {
        return tabsManager.postIframeMessage(
          data,
          {
            targetOrigin: options.targetOrigin ?? event.origin,
            transfer: options.transfer,
          },
          latestTab._id
        );
      },
    };

    if (await handleIframeTabClientRequest(tabsManager, payload)) return;

    const controllerOptions = tabsManager._getIframeControllerOptions(latestTab._id);
    if (controllerOptions?.onMessage) {
      const result = await controllerOptions.onMessage(payload);
      if (result === false) return;
    }
    onIframeMessage && onIframeMessage(payload);
    await tabsManager.hooks.call("iframe:message", payload);
  };

  return {
    emitIframeMessage,
  };
}

export type IframeMessageDispatcher = ReturnType<typeof createIframeMessageDispatcher>;
