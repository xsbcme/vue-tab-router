import type { Tab } from "../tabs/tab";
import {
  createIframeTabClientRequest,
  isIframeTabClientResponse,
  type IframeTabClientAction,
  type IframeTabClientPayload,
} from "./iframe-tab-client-protocol";

export type IframeTabClientMessageHandler<Data = unknown> = (data: Data, event: MessageEvent) => void;

export interface CreateIframeTabClientOptions {
  /** 宿主窗口 origin。默认当前页面 origin。跨域宿主需要显式传入。 */
  targetOrigin?: string;
  /** 请求超时时间。默认 10000ms。 */
  timeout?: number;
  /** 当前窗口，主要用于测试或特殊运行环境。 */
  currentWindow?: Window;
  /** 宿主窗口，默认 currentWindow.parent。 */
  parentWindow?: Window;
}

export interface IframeTabClient {
  /** 原始请求方法。 */
  request<Data = unknown>(action: IframeTabClientAction, payload?: IframeTabClientPayload): Promise<Data>;
  /** 获取当前 iframe 所属页签信息。 */
  getTab(): Promise<Partial<Tab>>;
  /** 让宿主打开一个新页签。 */
  openTab(viewUrl: string, options?: Record<string, unknown>): Promise<string | null>;
  /** 刷新当前 iframe 页签。 */
  refreshTab(): Promise<boolean>;
  /** 关闭当前 iframe 页签。 */
  closeTab(): Promise<boolean>;
  /** 更新当前 iframe 页签信息。 */
  updateTabOptions(options: Record<string, unknown>): Promise<boolean>;
  /** 向来源页签发送事件，等价于宿主侧 tabsManager.emit。 */
  emit(eventName: string, data?: unknown): Promise<boolean>;
  /** 监听宿主通过 postIframeMessage(data, options?, tabId?) 发来的消息。传入 `*` 可监听全部非协议消息。 */
  on<Data = unknown>(eventName: string, handler: IframeTabClientMessageHandler<Data>): () => void;
  /** 移除宿主消息监听。 */
  off<Data = unknown>(eventName: string, handler?: IframeTabClientMessageHandler<Data>): void;
  /** 清理请求与消息监听。 */
  dispose(): void;
}

function getMessageEventName(data: unknown) {
  if (!data || typeof data !== "object") return "message";
  const type = (data as Record<string, unknown>).type;
  return typeof type === "string" ? type : "message";
}

/**
 * 创建 iframe 内使用的页签 client。
 *
 * iframe 页面可通过它直接请求宿主操作当前页签，宿主会按消息来源自动定位 tabId。
 */
export function createIframeTabClient(options: CreateIframeTabClientOptions = {}): IframeTabClient {
  const currentWindow = options.currentWindow ?? (typeof window === "undefined" ? undefined : window);
  if (!currentWindow) {
    throw new Error("createIframeTabClient 只能在浏览器 iframe 页面中使用。");
  }

  const targetOrigin = options.targetOrigin ?? currentWindow.location.origin;
  const timeout = options.timeout ?? 10000;
  const parentWindow = options.parentWindow ?? currentWindow.parent;
  const pendingRequests = new Map<
    string,
    {
      resolve: (data: unknown) => void;
      reject: (error: Error) => void;
      timer: ReturnType<typeof setTimeout>;
    }
  >();
  const listeners = new Map<string, Set<IframeTabClientMessageHandler>>();

  const off = <Data = unknown>(eventName: string, handler?: IframeTabClientMessageHandler<Data>) => {
    const handlers = listeners.get(eventName) as Set<IframeTabClientMessageHandler<Data>> | undefined;
    if (!handlers) return;
    if (handler) {
      handlers.delete(handler);
    } else {
      handlers.clear();
    }
    if (!handlers.size) listeners.delete(eventName);
  };

  const emitLocalMessage = (eventName: string, data: unknown, event: MessageEvent) => {
    listeners.get(eventName)?.forEach(handler => handler(data, event));
    if (eventName !== "*") {
      listeners.get("*")?.forEach(handler => handler(data, event));
    }
  };

  const onMessage = (event: MessageEvent) => {
    if (event.source !== parentWindow) return;
    if (event.origin !== targetOrigin) return;

    const data = event.data;
    if (isIframeTabClientResponse(data)) {
      const pending = pendingRequests.get(data.id);
      if (!pending) return;
      clearTimeout(pending.timer);
      pendingRequests.delete(data.id);
      if (data.ok) {
        pending.resolve(data.data);
      } else {
        pending.reject(new Error(data.error || "Iframe tab client request failed"));
      }
      return;
    }

    emitLocalMessage(getMessageEventName(data), data, event);
  };

  currentWindow.addEventListener("message", onMessage);

  const request = <Data = unknown>(action: IframeTabClientAction, payload?: IframeTabClientPayload) => {
    const id = `${Date.now()}_${Math.random().toString(16).slice(2)}`;
    const message = createIframeTabClientRequest(id, action, payload);

    return new Promise<Data>((resolve, reject) => {
      const timer = setTimeout(() => {
        pendingRequests.delete(id);
        reject(new Error(`Iframe tab client request timeout: ${action}`));
      }, timeout);

      pendingRequests.set(id, { resolve: resolve as (data: unknown) => void, reject, timer });
      parentWindow.postMessage(message, targetOrigin);
    });
  };

  return {
    request,
    getTab: () => request<Partial<Tab>>("tab:get"),
    openTab: (viewUrl, tabOptions) => request<string | null>("tab:open", { viewUrl, options: tabOptions }),
    refreshTab: () => request<boolean>("tab:refresh"),
    closeTab: () => request<boolean>("tab:close"),
    updateTabOptions: tabOptions => request<boolean>("tab:update", { options: tabOptions }),
    emit: (eventName, data) => request<boolean>("tab:emit", { eventName, data }),
    on: <Data = unknown>(eventName: string, handler: IframeTabClientMessageHandler<Data>) => {
      const handlers = listeners.get(eventName) ?? new Set<IframeTabClientMessageHandler>();
      handlers.add(handler as IframeTabClientMessageHandler);
      listeners.set(eventName, handlers);
      return () => off(eventName, handler);
    },
    off,
    dispose: () => {
      currentWindow.removeEventListener("message", onMessage);
      listeners.clear();
      pendingRequests.forEach(({ reject, timer }) => {
        clearTimeout(timer);
        reject(new Error("Iframe tab client disposed"));
      });
      pendingRequests.clear();
    },
  };
}
