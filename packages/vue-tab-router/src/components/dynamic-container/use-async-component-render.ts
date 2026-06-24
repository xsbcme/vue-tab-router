import { Comment, Transition, computed, createVNode, onBeforeUnmount, ref, shallowRef, watch } from "vue";
import type { Component, TransitionProps, VNode } from "vue";
import { preloadComponent } from "@/shared";
import type { ITabsManagerOptions } from "@/types";
import { DefaultErrorComponent, DefaultLoadingComponent } from "@/components/default-state";

export interface AsyncComponentRenderOptions {
  source?: ITabsManagerOptions["source"];
  loadingComponent?: Component;
  errorComponent?: Component;
  transitionProps?: TransitionProps;
}

const omitTransitionHooks = (transitionProps: TransitionProps) => {
  const {
    onAfterAppear,
    onAfterEnter,
    onAfterLeave,
    onAppear,
    onAppearCancelled,
    onBeforeAppear,
    onBeforeEnter,
    onBeforeLeave,
    onEnter,
    onEnterCancelled,
    onLeave,
    onLeaveCancelled,
    ...visualTransitionProps
  } = transitionProps;

  return visualTransitionProps;
};

export function useAsyncComponentRender(options: AsyncComponentRenderOptions) {
  const resolvedAsyncComponent = shallowRef<Component | null>(null);
  const asyncLoadError = shallowRef<unknown>(null);
  const showAsyncLoading = ref(false);
  const asyncTransitionProps = computed(() =>
    options.transitionProps?.name ? omitTransitionHooks(options.transitionProps) : null
  );
  let asyncLoadToken = 0;
  let loadingTimer: ReturnType<typeof window.setTimeout> | undefined;
  let timeoutTimer: ReturnType<typeof window.setTimeout> | undefined;

  const clearTimers = () => {
    if (loadingTimer !== undefined) window.clearTimeout(loadingTimer);
    if (timeoutTimer !== undefined) window.clearTimeout(timeoutTimer);
    loadingTimer = undefined;
    timeoutTimer = undefined;
  };

  const reset = () => {
    clearTimers();
    resolvedAsyncComponent.value = null;
    asyncLoadError.value = null;
    showAsyncLoading.value = false;
  };

  const load = (component: Component | undefined) => {
    asyncLoadToken += 1;
    reset();

    if (!component) return;
    const asyncLoader = Reflect.get(component, "__asyncLoader");
    if (typeof asyncLoader !== "function") {
      resolvedAsyncComponent.value = component;
      return;
    }

    const loadToken = asyncLoadToken;
    const delay = options.source?.delay ?? 0;
    const timeout = options.source?.timeout;

    if (delay <= 0) {
      showAsyncLoading.value = true;
    } else {
      loadingTimer = window.setTimeout(() => {
        if (loadToken === asyncLoadToken) showAsyncLoading.value = true;
      }, delay);
    }

    timeoutTimer =
      timeout == null
        ? undefined
        : window.setTimeout(() => {
            if (loadToken === asyncLoadToken && !resolvedAsyncComponent.value) {
              asyncLoadError.value = new Error(`Async component timed out after ${timeout}ms.`);
            }
          }, timeout);

    preloadComponent(component)
      .then(() => {
        if (loadToken !== asyncLoadToken) return;
        resolvedAsyncComponent.value = component;
      })
      .catch(error => {
        if (loadToken !== asyncLoadToken) return;
        asyncLoadError.value = error;
      })
      .finally(() => {
        if (loadToken === asyncLoadToken) clearTimers();
      });
  };

  const renderWithTransition = (render: () => VNode, key: string) => {
    const vnode = render();
    vnode.key = key;
    if (!asyncTransitionProps.value) return vnode;

    return createVNode(
      Transition,
      {
        appear: true,
        mode: "out-in",
        ...asyncTransitionProps.value,
      },
      { default: () => [vnode] }
    );
  };

  const render = (renderResolved: (component: Component) => VNode) => {
    if (asyncLoadError.value) {
      return renderWithTransition(
        () => createVNode(options.errorComponent || DefaultErrorComponent, { error: asyncLoadError.value }),
        "error"
      );
    }

    if (!resolvedAsyncComponent.value) {
      if (!showAsyncLoading.value) return createVNode(Comment);
      return renderWithTransition(() => createVNode(options.loadingComponent || DefaultLoadingComponent), "loading");
    }

    return renderWithTransition(() => renderResolved(resolvedAsyncComponent.value!), "resolved");
  };

  onBeforeUnmount(() => {
    asyncLoadToken += 1;
    clearTimers();
  });

  return {
    load,
    render,
    watchComponent: (source: () => Component | undefined) => watch(source, load, { immediate: true }),
  };
}
