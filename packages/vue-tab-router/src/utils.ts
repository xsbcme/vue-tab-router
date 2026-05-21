import { Component, ComponentInternalInstance } from "vue";
import { RELATIVE_VIEW_URL_PREFIX_KEY } from "./constant";

export function findParentPathsByPath(paths: string[], path: string) {
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

export function isHttpUrl(url: string | undefined) {
  try {
    if (!url) return false;
    const { protocol } = new URL(url);
    return ["http:", "https:"].includes(protocol);
  } catch (err) {
    return false;
  }
}

export function clone<T = any>(obj: T): T {
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

/**
 * 将内部 URL（relative: 前缀或普通 http/https）转换为可直接使用的真实 URL。
 */
export function resolveViewUrl(url: string) {
  if (url.startsWith(RELATIVE_VIEW_URL_PREFIX_KEY)) {
    return url.replace(RELATIVE_VIEW_URL_PREFIX_KEY, "");
  }
  return url;
}
