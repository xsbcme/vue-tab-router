import { Component, ComponentInternalInstance } from "vue";

const TAB_VIEW_URL_RELATIVE_PREFIX = "relative:";

export type TabViewUrlRelative = `${typeof TAB_VIEW_URL_RELATIVE_PREFIX}${string}`;

function isTabViewHttpUrl(url: string | undefined) {
  try {
    if (!url) return false;
    const { protocol } = new URL(url);
    return ["http:", "https:"].includes(protocol);
  } catch (err) {
    return false;
  }
}

function isTabViewRelativeUrl(url: string | undefined): url is TabViewUrlRelative {
  return Boolean(url?.startsWith(TAB_VIEW_URL_RELATIVE_PREFIX));
}

function isTabViewIframeUrl(url: string | undefined) {
  return isTabViewRelativeUrl(url) || isTabViewHttpUrl(url);
}

function createRelativeTabViewUrl(url: string): TabViewUrlRelative {
  if (isTabViewRelativeUrl(url)) return url;
  return `${TAB_VIEW_URL_RELATIVE_PREFIX}${url}`;
}

function resolveIframeTabViewUrl(url: string) {
  if (isTabViewRelativeUrl(url)) {
    return url.slice(TAB_VIEW_URL_RELATIVE_PREFIX.length);
  }
  return url;
}

export const TabViewUrl = {
  createRelative: createRelativeTabViewUrl,
  isHttp: isTabViewHttpUrl,
  isIframe: isTabViewIframeUrl,
  isRelative: isTabViewRelativeUrl,
  resolveIframe: resolveIframeTabViewUrl,
};

export function stableStringify(value: unknown, seen = new WeakSet<object>()): string {
  if (Array.isArray(value)) {
    if (seen.has(value)) return '"[Circular]"';
    seen.add(value);
    const result = `[${value.map(item => stableStringify(item, seen)).join(",")}]`;
    seen.delete(value);
    return result;
  }
  if (value && typeof value === "object") {
    if (seen.has(value)) return '"[Circular]"';
    seen.add(value);
    const record = value as Record<string, unknown>;
    const entries = Object.keys(record)
      .sort()
      .map(key => `${JSON.stringify(key)}:${stableStringify(record[key], seen)}`);
    const result = `{${entries.join(",")}}`;
    seen.delete(value);
    return result;
  }
  return JSON.stringify(value);
}

export function findParentPathsByPath(paths: string[], path: string | undefined) {
  if (!path) return [];
  const result: string[] = [];
  const targetPathNodes = path.split("/").filter(Boolean);
  const lastNode = targetPathNodes.pop();
  for (let index = targetPathNodes.length - 1; index >= 0; index--) {
    const tmpPath = targetPathNodes.slice(0, index + 1).join("/");
    const findPath = tmpPath + "/" + lastNode;
    const t = paths.find(path => path.endsWith(findPath));
    if (t) {
      result.push(t);
    }
  }
  return result.reverse();
}
export function jsonToObject<T extends string | object>(val: T, def = {}): object {
  try {
    if (val === null || val === undefined) {
      return def;
    }
    if (typeof val !== "string") {
      return val;
    }
    return JSON.parse(val);
  } catch {
    return def;
  }
}

export function clone<T = unknown>(obj: T): T {
  try {
    return JSON.parse(JSON.stringify(obj));
  } catch (error) {
    return obj;
  }
}

export function createRandomString(length: number = 4): string {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

export async function preloadComponent(component: Component) {
  const __asyncLoader = Reflect.get(component, "__asyncLoader");
  if (typeof __asyncLoader === "function") {
    return (await __asyncLoader.call(component)) as Component;
  } else {
    return component;
  }
}

export function findVueComponent(node: ComponentInternalInstance, componentName: string) {
  if (!node) return null;
  if (node["components"]) {
    if (node["components"][componentName]) {
      return node["components"][componentName];
    }
  }
  if (node.parent) {
    return findVueComponent(node.parent, componentName);
  }
  return node.appContext.components[componentName];
}
