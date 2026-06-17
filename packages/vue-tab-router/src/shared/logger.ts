export interface TabRouterLogger {
  debug?(message: string, context?: unknown): void;
  warn?(message: string, context?: unknown): void;
  error?(message: string, context?: unknown): void;
}

export function resolveTabRouterLogger(logger: TabRouterLogger | false | undefined): TabRouterLogger {
  if (logger === false) return {};
  if (logger) return logger;

  return {
    error(message, context) {
      if (typeof console !== "undefined") {
        console.error(message, context);
      }
    },
    warn(message, context) {
      if (typeof console !== "undefined") {
        console.warn(message, context);
      }
    },
  };
}
