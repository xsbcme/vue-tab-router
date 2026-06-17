export type TabRouterErrorCode =
  | "TAB_NOT_FOUND"
  | "VIEW_NOT_REGISTERED"
  | "GUARD_REJECTED"
  | "URL_SYNC_FAILED"
  | "IFRAME_MESSAGE_FAILED";

export class TabRouterError extends Error {
  public constructor(
    public readonly code: TabRouterErrorCode,
    message: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = "TabRouterError";
  }
}

export function createTabRouterError(code: TabRouterErrorCode, message: string, cause?: unknown) {
  return new TabRouterError(code, message, cause);
}

export function createTabNotFoundError(tabId: string | undefined) {
  return createTabRouterError("TAB_NOT_FOUND", `标签页不存在[${tabId || ""}]`);
}

export function createViewNotRegisteredError(viewUrl: string) {
  return createTabRouterError("VIEW_NOT_REGISTERED", `视图未注册[${viewUrl}]`);
}
