<template>
  <div class="preview">
    <template v-if="previewManager.tabs.length > tabsVisibleThreshold">
      <div class="preview-tabs">
        <DynamicTabsComponent :hide-first="hideFirstTab" />
      </div>
    </template>
    <div class="preview-content">
      <div class="preview-wrapper">
        <DynamicContainerComponent />
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { computed, provide, reactive, watch } from "vue";
import { jsonToObject } from "../shared";
import { useTabsManager } from "../composables/use-tabs-manager";
import { TABS_MANAGER_KEY } from "../tabs/tabs-manager-context";
import type { TabsManager } from "../tabs/tabs-manager";
import type { IframeMessageEvent } from "../iframe/iframe-message";
import DynamicContainerComponent from "./dynamic-container";
import DynamicTabsComponent from "./dynamic-tabs/index.vue";

const props = withDefaults(
  defineProps<{
    viewUrl: string;
    viewProps?: Record<string, unknown> | string;
    viewName?: string;
    sourceTabId?: string;
    closeSourceTabOnRootClose?: boolean;
    tabsVisibleThreshold?: number;
    hideFirstTab?: boolean;
  }>(),
  {
    viewProps: () => ({}),
    viewName: "首页",
    tabsVisibleThreshold: 1,
    hideFirstTab: false,
  }
);

const emit = defineEmits<{
  error: [error: unknown];
  close: [tabId?: string];
}>();

const parentTabsManager = useTabsManager();
let previewManager: TabsManager;
let openVersion = 0;
let previewRootTabId: string | undefined;

const getMessagePayload = (data: unknown) => (data && typeof data === "object" ? (data as Record<string, unknown>) : undefined);

const requestSourceTabClose = async () => {
  if (!props.sourceTabId) {
    emit("close");
    return true;
  }

  if (!parentTabsManager.getTabById(props.sourceTabId)) {
    emit("close", props.sourceTabId);
    return true;
  }

  await parentTabsManager.closeTab(props.sourceTabId);
  return !parentTabsManager.getTabById(props.sourceTabId);
};

const handleIframeMessage = async (message: IframeMessageEvent) => {
  const payload = getMessagePayload(message.data);
  if (payload?.type === "iframe:close-current") {
    try {
      if (props.closeSourceTabOnRootClose && message.tabId === previewRootTabId) {
        const closed = await requestSourceTabClose();
        message.reply({ type: closed ? "host:close-requested" : "host:close-rejected" });
        return;
      }
      await previewManager.closeTab(message.tabId);
      message.reply({ type: "host:close-requested" });
    } catch (error) {
      emit("error", error);
      message.reply({ type: "host:close-rejected" });
    }
    return;
  }

  if (payload?.type === "iframe:refresh-current") {
    try {
      await previewManager.refreshTab(message.tabId);
      message.reply({ type: "host:refreshed" });
    } catch (error) {
      emit("error", error);
      message.reply({ type: "host:refresh-rejected" });
    }
    return;
  }

  parentTabsManager.options.onIframeMessage?.(message);
};

previewManager = reactive(
  parentTabsManager.createScopedManager({
    storageEnabled: false,
    onIframeMessage: handleIframeMessage,
  })
) as TabsManager;
provide(TABS_MANAGER_KEY, previewManager);

const parsedViewProps = computed<Record<string, unknown>>(
  () => jsonToObject(props.viewProps || {}, {}) as Record<string, unknown>
);

const previewKey = computed(() => JSON.stringify([props.viewUrl, props.viewName, parsedViewProps.value]));

const openPreviewTab = async () => {
  const version = ++openVersion;
  const viewUrl = props.viewUrl;
  if (!viewUrl) return;

  try {
    const tabId = await previewManager.openFirstTab(
      viewUrl,
      {
        _viewName: props.viewName,
        ...parsedViewProps.value,
      },
      "clear"
    );
    if (version !== openVersion) return;
    previewRootTabId = tabId;
    if (props.closeSourceTabOnRootClose) {
      previewManager._setNoCloseTabCloseHandler(async tab => {
        if (tab._id !== previewRootTabId) return false;
        return await requestSourceTabClose();
      });
    } else {
      previewManager._setNoCloseTabCloseHandler(undefined);
    }
  } catch (error) {
    if (version === openVersion) {
      emit("error", error);
    }
  }
};

const refresh = () => previewManager.refreshTab();

defineExpose({
  refresh,
});

watch(previewKey, openPreviewTab, { immediate: true });
</script>
<style lang="scss" scoped>
.preview {
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;

  &-tabs {
    padding: 8px 16px;
    border-bottom: 1px solid #e5e6eb;
  }

  &-content {
    flex: 1;
    overflow: hidden;
  }

  &-wrapper {
    height: 100%;
    width: 100%;
    overflow: auto;
    padding: 16px;
  }
}
</style>
