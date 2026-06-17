import type { Tab } from "../../tabs";
import { TabViewUrl } from "../../shared";

function readIframeLocationHref(iframe: HTMLIFrameElement) {
  try {
    return iframe.contentWindow?.location.href;
  } catch (error) {
    return undefined;
  }
}

export function resolveIframeNavigationViewUrl(tab: Partial<Tab>, iframe: HTMLIFrameElement) {
  if (!TabViewUrl.isIframe(tab.viewUrl)) return undefined;

  const href = readIframeLocationHref(iframe);
  if (!href || href === "about:blank") return undefined;

  if (TabViewUrl.isRelative(tab.viewUrl)) {
    try {
      const currentUrl = new URL(href, window.location.href);
      if (!["http:", "https:"].includes(currentUrl.protocol)) return undefined;
      return TabViewUrl.createRelative(`${currentUrl.pathname}${currentUrl.search}${currentUrl.hash}`);
    } catch (error) {
      return undefined;
    }
  }

  if (TabViewUrl.isHttp(tab.viewUrl)) return href;
  return undefined;
}
