<template>
  <div class="preview">
    <template v-if="tabsManager.tabs.some(t => !t._isFirst)">
      <div class="preview-tabs">
        <DynamicTabsComponent hide-first />
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
import { computed, watch } from "vue";
import { jsonToObject } from "../../utils";
import { useTabsManager } from "../../use-tabs-manager";
import DynamicContainerComponent from "../dynamic-container";
import DynamicTabsComponent from "../dynamic-tabs/index.vue";

const props = withDefaults(
  defineProps<{
    viewUrl: string;
    viewProps?: Record<string, unknown> | string;
    viewName?: string;
  }>(),
  {
    viewProps: () => ({}),
    viewName: "首页",
  }
);

const emit = defineEmits<{
  error: [error: unknown];
}>();

const tabsManager = useTabsManager();
let openVersion = 0;

const parsedViewProps = computed<Record<string, unknown>>(
  () => jsonToObject(props.viewProps || {}, {}) as Record<string, unknown>
);

const previewKey = computed(() => JSON.stringify([props.viewUrl, props.viewName, parsedViewProps.value]));

const openPreviewTab = async () => {
  const version = ++openVersion;
  const viewUrl = props.viewUrl;
  if (!viewUrl) return;

  try {
    await tabsManager.openFirstTab(
      viewUrl,
      {
        _viewName: props.viewName,
        ...parsedViewProps.value,
      },
      "clear"
    );
    if (version !== openVersion) return;
  } catch (error) {
    if (version === openVersion) {
      emit("error", error);
    }
  }
};

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
