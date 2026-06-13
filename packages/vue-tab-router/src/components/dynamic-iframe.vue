<template>
  <div class="dynamic-iframe">
    <iframe ref="iframeRef" class="dynamic-iframe-content" :src="iframeUrl" :title="title" @load="onLoad">
      您的浏览器不支持内联框架
    </iframe>
    <component :is="loadingComponent" v-if="loading" class="dynamic-iframe-loading" />
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, shallowRef, watch } from "vue";
import type { Component } from "vue";
import {
  type DynamicIframeExpose,
  isIframeMessageOriginAllowed,
  resolveIframeMessageTargetOrigin,
  type IframeMessageOriginValidator,
} from "../iframe-message";
import type { Tab } from "../tab";
import { DefaultLoadingComponent } from "./default-state";

defineOptions({
  name: "DynamicIframe",
});

const emit = defineEmits<{
  load: [e: Event, iframe: HTMLIFrameElement];
  message: [e: MessageEvent];
}>();

const props = withDefaults(
  defineProps<{
    link: string;
    linkProps?: Record<string, unknown>;
    title?: string;
    loadingComponent?: Component;
    allowedOrigins?: IframeMessageOriginValidator;
    messageTab?: Partial<Tab>;
  }>(),
  {
    linkProps: () => ({}),
    title: "内联页面",
    loadingComponent: () => DefaultLoadingComponent,
  }
);

const loading = shallowRef(true);
const iframeRef = shallowRef<HTMLIFrameElement>();
const lastCompletedUrl = shallowRef<string>();
let sameDocumentLoadVersion = 0;
let cleanupIframeNavigationListeners: (() => void) | undefined;

function resolveUrl(url: string) {
  try {
    return new URL(url, window.location.href);
  } catch (error) {
    return undefined;
  }
}

function readCurrentIframeUrl() {
  const iframe = iframeRef.value;
  if (!iframe) return undefined;

  try {
    const href = iframe.contentWindow?.location.href;
    if (href && href !== "about:blank") return href;
  } catch (error) {
    return iframe.src || undefined;
  }

  return iframe.src || undefined;
}

function isSameUrl(urlA: string, urlB: string) {
  const parsedUrlA = resolveUrl(urlA);
  const parsedUrlB = resolveUrl(urlB);
  if (!parsedUrlA || !parsedUrlB) return urlA === urlB;

  return parsedUrlA.href === parsedUrlB.href;
}

function isSameDocumentUrl(urlA: string, urlB: string) {
  const current = resolveUrl(urlA);
  const next = resolveUrl(urlB);
  if (!current || !next) return urlA === urlB;

  current.hash = "";
  next.hash = "";
  return current.href === next.href;
}

function bindIframeNavigationListeners() {
  cleanupIframeNavigationListeners?.();
  cleanupIframeNavigationListeners = undefined;

  try {
    const frameWindow = iframeRef.value?.contentWindow;
    if (!frameWindow) return;

    frameWindow.addEventListener("hashchange", emitSameDocumentLoad);
    frameWindow.addEventListener("popstate", emitSameDocumentLoad);
    cleanupIframeNavigationListeners = () => {
      frameWindow.removeEventListener("hashchange", emitSameDocumentLoad);
      frameWindow.removeEventListener("popstate", emitSameDocumentLoad);
    };
  } catch (error) {
    cleanupIframeNavigationListeners = undefined;
  }
}

function completeIframeLoad(e: Event, completedUrl = readCurrentIframeUrl() || iframeUrl.value) {
  sameDocumentLoadVersion++;
  loading.value = false;
  lastCompletedUrl.value = completedUrl;
  bindIframeNavigationListeners();

  if (iframeRef.value) {
    emit("load", e, iframeRef.value);
  }
}

function emitSameDocumentLoad(e: Event) {
  const completedUrl = readCurrentIframeUrl() || iframeUrl.value;
  if (lastCompletedUrl.value && isSameUrl(lastCompletedUrl.value, completedUrl)) return;

  const iframe = iframeRef.value;
  if (!iframe) return;

  if (e.type === "load") {
    completeIframeLoad(e, completedUrl);
    return;
  }

  iframe.dispatchEvent(new Event("load"));
}

function hasCompletedSameDocument(nextUrl: string) {
  const completedUrl = lastCompletedUrl.value;
  if (!completedUrl) return false;

  return isSameDocumentUrl(completedUrl, nextUrl);
}

const iframeUrl = computed(() => {
  const hashIndex = props.link.indexOf("#");
  const linkWithoutHash = hashIndex >= 0 ? props.link.slice(0, hashIndex) : props.link;
  const hash = hashIndex >= 0 ? props.link.slice(hashIndex + 1) : "";
  const queryIndex = linkWithoutHash.indexOf("?");
  const path = queryIndex >= 0 ? linkWithoutHash.slice(0, queryIndex) : linkWithoutHash;
  const queryString = queryIndex >= 0 ? linkWithoutHash.slice(queryIndex + 1) : "";
  const queryParams = new URLSearchParams(queryString);

  Object.entries(props.linkProps || {}).forEach(([key, value]) => {
    queryParams.delete(key);
    if (value === undefined || value === null) return;

    if (Array.isArray(value)) {
      value.forEach(item => queryParams.append(key, String(item)));
      return;
    }

    queryParams.set(key, String(value));
  });

  const query = queryParams.toString();
  return `${path}${query ? `?${query}` : ""}${hash ? `#${hash}` : ""}`;
});

watch(iframeUrl, async nextUrl => {
  if (!hasCompletedSameDocument(nextUrl)) {
    loading.value = true;
    cleanupIframeNavigationListeners?.();
    cleanupIframeNavigationListeners = undefined;
    return;
  }

  if (lastCompletedUrl.value && isSameUrl(lastCompletedUrl.value, nextUrl)) return;

  const currentVersion = ++sameDocumentLoadVersion;
  await nextTick();
  if (currentVersion !== sameDocumentLoadVersion) return;
  if (hasCompletedSameDocument(nextUrl)) {
    emitSameDocumentLoad(new Event("load"));
  }
});

const onLoad = (e: Event) => {
  completeIframeLoad(e);
};

const onMessage = (e: MessageEvent) => {
  if (e.source !== iframeRef.value?.contentWindow) return;
  if (!isIframeMessageOriginAllowed(props.allowedOrigins, e.origin, props.messageTab || {}, e)) return;
  emit("message", e);
};

const postMessage = (
  data: unknown,
  targetOrigin = resolveIframeMessageTargetOrigin(iframeUrl.value),
  transfer?: Transferable[]
) => {
  const targetWindow = iframeRef.value?.contentWindow;
  if (!targetWindow) return false;
  if (transfer) {
    targetWindow.postMessage(data, targetOrigin, transfer);
  } else {
    targetWindow.postMessage(data, targetOrigin);
  }
  return true;
};

onMounted(() => {
  window.addEventListener("message", onMessage);
});

onBeforeUnmount(() => {
  cleanupIframeNavigationListeners?.();
  window.removeEventListener("message", onMessage);
});

defineExpose<DynamicIframeExpose>({
  postMessage,
  iframe: iframeRef,
});
</script>

<style lang="scss" scoped>
.dynamic-iframe {
  width: 100%;
  height: 100%;
  position: relative;

  &-content {
    display: block;
    width: 100%;
    height: 100%;
    border: 0;
    overflow: hidden;
  }

  &-loading {
    position: absolute;
    top: 0;
    left: 0;
  }
}
</style>
