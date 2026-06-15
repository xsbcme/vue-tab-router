import type { Tab } from "../tabs/tab";

const IFRAME_TAB_CLIENT_MESSAGE = "tab-router:iframe-tab-client";

export type IframeTabClientAction = "tab:get" | "tab:open" | "tab:refresh" | "tab:close" | "tab:update" | "tab:emit";

export type IframeTabClientPayload = Record<string, unknown>;

/** iframe 内请求宿主执行的当前页签动作。 */
export interface IframeTabClientRequest<Action extends IframeTabClientAction = IframeTabClientAction> {
  /** iframe client 协议标记。 */
  __tabRouterType: typeof IFRAME_TAB_CLIENT_MESSAGE;
  /** 请求 id，用于匹配响应。 */
  id: string;
  /** 当前页签动作。 */
  action: Action;
  /** 动作参数。 */
  payload?: IframeTabClientPayload;
}

/** 宿主回复 iframe client 的结果。 */
export interface IframeTabClientResponse<Data = unknown> {
  /** iframe client 协议标记。 */
  __tabRouterType: typeof IFRAME_TAB_CLIENT_MESSAGE;
  /** 对应请求 id。 */
  id: string;
  /** 是否执行成功。 */
  ok: boolean;
  /** 成功时的返回值。 */
  data?: Data;
  /** 失败时的错误信息。 */
  error?: string;
}

export interface IframeTabOpenPayload {
  /** 要打开的页面地址。 */
  viewUrl: string;
  /** openTab 参数。 */
  options?: Record<string, unknown>;
}

export interface IframeTabUpdatePayload {
  /** updateTabOptions 参数。 */
  options?: Record<string, unknown>;
}

export interface IframeTabEmitPayload {
  /** 发送给来源页签的事件名。 */
  eventName: string;
  /** 事件数据。 */
  data?: unknown;
}

export function isIframeTabClientRequest(data: unknown): data is IframeTabClientRequest {
  return Boolean(
    data &&
      typeof data === "object" &&
      isIframeTabClientMessage(data as Partial<IframeTabClientRequest>) &&
      typeof (data as IframeTabClientRequest).id === "string" &&
      typeof (data as IframeTabClientRequest).action === "string"
  );
}

export function isIframeTabClientResponse(data: unknown): data is IframeTabClientResponse {
  return Boolean(
    data &&
      typeof data === "object" &&
      isIframeTabClientMessage(data as Partial<IframeTabClientResponse>) &&
      typeof (data as IframeTabClientResponse).id === "string" &&
      typeof (data as IframeTabClientResponse).ok === "boolean"
  );
}

function isIframeTabClientMessage(data: Partial<IframeTabClientRequest | IframeTabClientResponse>) {
  return data.__tabRouterType === IFRAME_TAB_CLIENT_MESSAGE;
}

export function createIframeTabClientRequest(
  id: string,
  action: IframeTabClientAction,
  payload?: IframeTabClientPayload
): IframeTabClientRequest {
  return {
    __tabRouterType: IFRAME_TAB_CLIENT_MESSAGE,
    id,
    action,
    payload,
  };
}

export function createIframeTabClientResponse<Data = unknown>(
  request: Pick<IframeTabClientRequest, "id">,
  ok: boolean,
  data?: Data,
  error?: string
): IframeTabClientResponse<Data> {
  return {
    __tabRouterType: IFRAME_TAB_CLIENT_MESSAGE,
    id: request.id,
    ok,
    data,
    error,
  };
}

export type IframeTabClientTab = Partial<Tab>;
