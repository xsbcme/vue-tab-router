import { ref, type TransitionProps } from "vue";

const callTransitionHook = (hook: unknown, ...args: unknown[]) => {
  if (Array.isArray(hook)) {
    hook.forEach(item => callTransitionHook(item, ...args));
    return;
  }
  if (typeof hook === "function") hook(...args);
};

const callEnterHook = (hook: unknown, element: Element, done: () => void) => {
  let isDone = false;
  const doneOnce = () => {
    if (isDone) return;
    isDone = true;
    done();
  };
  if (Array.isArray(hook)) {
    hook.forEach(item => callEnterHook(item, element, doneOnce));
    return;
  }
  if (typeof hook === "function") {
    hook(element, doneOnce);
    return;
  }
  doneOnce();
};

export function useTransitionRenderReady(transitionProps: TransitionProps | undefined) {
  const isRenderPending = ref(false);
  const renderTransitionClass = ref<string>();
  let renderReadyPromise: Promise<void> | undefined;
  let pendingRenderReadyResolve: (() => void) | undefined;

  const getTransitionClass = (phase: "enter" | "leave") => {
    return transitionProps?.name ? `${transitionProps.name}-${phase}-active` : undefined;
  };

  const beginRenderReadyWait = () => {
    pendingRenderReadyResolve?.();
    isRenderPending.value = true;
    renderTransitionClass.value = getTransitionClass("enter");
    renderReadyPromise = new Promise<void>(resolve => {
      pendingRenderReadyResolve = resolve;
    });
  };

  const resolveRenderReady = () => {
    pendingRenderReadyResolve?.();
    pendingRenderReadyResolve = undefined;
    renderReadyPromise = undefined;
    isRenderPending.value = false;
    renderTransitionClass.value = undefined;
  };

  const waitForRenderReady = () => {
    if (!transitionProps?.name) return Promise.resolve();
    return renderReadyPromise || Promise.resolve();
  };

  const renderReadyTransitionHooks: Partial<TransitionProps> = {
    onBeforeAppear: element => {
      beginRenderReadyWait();
      callTransitionHook(transitionProps?.onBeforeAppear, element);
    },
    onBeforeEnter: element => {
      beginRenderReadyWait();
      callTransitionHook(transitionProps?.onBeforeEnter, element);
    },
    onBeforeLeave: element => {
      renderTransitionClass.value = getTransitionClass("leave");
      callTransitionHook(transitionProps?.onBeforeLeave, element);
    },
    onAfterAppear: element => {
      callTransitionHook(transitionProps?.onAfterAppear, element);
      resolveRenderReady();
    },
    onAfterEnter: element => {
      callTransitionHook(transitionProps?.onAfterEnter, element);
      resolveRenderReady();
    },
    onAppearCancelled: element => {
      callTransitionHook(transitionProps?.onAppearCancelled, element);
      resolveRenderReady();
    },
    onEnterCancelled: element => {
      callTransitionHook(transitionProps?.onEnterCancelled, element);
      resolveRenderReady();
    },
    onAfterLeave: element => {
      callTransitionHook(transitionProps?.onAfterLeave, element);
      if (!isRenderPending.value) renderTransitionClass.value = undefined;
    },
    onLeaveCancelled: element => {
      callTransitionHook(transitionProps?.onLeaveCancelled, element);
      if (!isRenderPending.value) renderTransitionClass.value = undefined;
    },
  };

  if (transitionProps?.onAppear) {
    renderReadyTransitionHooks.onAppear = (element, done) => {
      callEnterHook(transitionProps.onAppear, element, () => {
        done();
        resolveRenderReady();
      });
    };
  }

  if (transitionProps?.onEnter) {
    renderReadyTransitionHooks.onEnter = (element, done) => {
      callEnterHook(transitionProps.onEnter, element, () => {
        done();
        resolveRenderReady();
      });
    };
  }

  return {
    isRenderPending,
    renderTransitionClass,
    renderReadyTransitionHooks,
    waitForRenderReady,
  };
}