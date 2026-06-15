import type { App, Plugin } from "vue";

import "./style.scss";

interface ScrollbarPluginOptions {
  hideDelay?: number;
}

const SCROLLBAR_ACTIVE_CLASS = "is-scrollbar-active";
const DEFAULT_SCROLLBAR_HIDE_DELAY = 300;
const scrollbarListenerOptions = { passive: true, capture: true } as const;
const scrollbarEvents = ["pointermove", "wheel", "scroll", "touchmove", "focusin"] as const;

const isScrollableElement = (element: HTMLElement) => {
  const { overflowX, overflowY } = window.getComputedStyle(element);

  const canScrollX = ["auto", "scroll", "overlay"].includes(overflowX) && element.scrollWidth > element.clientWidth;
  const canScrollY = ["auto", "scroll", "overlay"].includes(overflowY) && element.scrollHeight > element.clientHeight;

  return canScrollX || canScrollY;
};

const getScrollableElement = (event: Event) => {
  const eventPath = event.composedPath();

  for (const eventTarget of eventPath) {
    if (eventTarget instanceof HTMLElement && isScrollableElement(eventTarget)) {
      return eventTarget;
    }
  }

  return undefined;
};

export const createScrollbarPlugin = (options: ScrollbarPluginOptions = {}): Plugin => ({
  install(app: App) {
    if (typeof window === "undefined") {
      return;
    }

    const hideDelay = options.hideDelay ?? DEFAULT_SCROLLBAR_HIDE_DELAY;

    let activeScrollbarElement: HTMLElement | undefined;
    let hideScrollbarTimer: ReturnType<typeof window.setTimeout> | undefined;
    let showScrollbarFrame: ReturnType<typeof window.requestAnimationFrame> | undefined;
    let pendingScrollbarEvent: Event | undefined;

    const removeActiveScrollbar = () => {
      activeScrollbarElement?.classList.remove(SCROLLBAR_ACTIVE_CLASS);
      activeScrollbarElement = undefined;
    };

    const setActiveScrollbar = (element: HTMLElement) => {
      if (activeScrollbarElement && activeScrollbarElement !== element) {
        activeScrollbarElement.classList.remove(SCROLLBAR_ACTIVE_CLASS);
      }

      activeScrollbarElement = element;
      activeScrollbarElement.classList.add(SCROLLBAR_ACTIVE_CLASS);
    };

    const showScrollbar = () => {
      showScrollbarFrame = undefined;

      if (!pendingScrollbarEvent) {
        return;
      }

      const scrollableElement = getScrollableElement(pendingScrollbarEvent);

      if (!scrollableElement) {
        return;
      }

      setActiveScrollbar(scrollableElement);

      if (hideScrollbarTimer) {
        window.clearTimeout(hideScrollbarTimer);
      }

      hideScrollbarTimer = window.setTimeout(removeActiveScrollbar, hideDelay);
    };

    const scheduleShowScrollbar = (event: Event) => {
      pendingScrollbarEvent = event;

      if (showScrollbarFrame) {
        return;
      }

      showScrollbarFrame = window.requestAnimationFrame(showScrollbar);
    };

    const cleanup = () => {
      scrollbarEvents.forEach(eventName => {
        window.removeEventListener(eventName, scheduleShowScrollbar, scrollbarListenerOptions);
      });

      if (hideScrollbarTimer) {
        window.clearTimeout(hideScrollbarTimer);
      }

      if (showScrollbarFrame) {
        window.cancelAnimationFrame(showScrollbarFrame);
      }

      removeActiveScrollbar();
    };

    scrollbarEvents.forEach(eventName => {
      window.addEventListener(eventName, scheduleShowScrollbar, scrollbarListenerOptions);
    });

    const originalUnmount = app.unmount;

    app.unmount = (...args) => {
      cleanup();
      originalUnmount(...args);
    };
  },
});

export default createScrollbarPlugin();