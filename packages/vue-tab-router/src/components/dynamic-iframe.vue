<template>
  <div class="dynamic-iframe">
    <iframe
      ref="iframeRef"
      class="dynamic-iframe-content"
      :src="iframeUrl"
      :title="title"
      @load="onLoad"
    >
      您的浏览器不支持内联框架
    </iframe>
    <template v-if="loading">
      <div class="dynamic-iframe-loading">内联框架加载中...</div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, shallowRef, watch } from "vue";
import {
  type DynamicIframeExpose,
  isIframeMessageOriginAllowed,
  resolveIframeMessageTargetOrigin,
  type IframeMessageOriginValidator,
} from "../iframe-message";
import type { Tab } from "../tab";

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
    allowedOrigins?: IframeMessageOriginValidator;
    messageTab?: Partial<Tab>;
  }>(),
  {
    linkProps: () => ({}),
    title: "内联页面",
  }
);

const loading = shallowRef(true);
const iframeRef = shallowRef<HTMLIFrameElement>();

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

watch(iframeUrl, () => {
  loading.value = true;
});

const onLoad = (e: Event) => {
  loading.value = false;
  if (iframeRef.value) {
    emit("load", e, iframeRef.value);
  }
};

const onMessage = (e: MessageEvent) => {
  if (e.source !== iframeRef.value?.contentWindow) return;
  if (!isIframeMessageOriginAllowed(props.allowedOrigins, e.origin, props.messageTab || {}, e)) return;
  emit("message", e);
};

const postMessage = (data: unknown, targetOrigin = resolveIframeMessageTargetOrigin(iframeUrl.value), transfer?: Transferable[]) => {
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
