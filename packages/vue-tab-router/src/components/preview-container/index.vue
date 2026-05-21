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
import { onMounted } from "vue";
import { useTabsManager } from "../../use-tabs-manager";
import DynamicContainerComponent from "../dynamic-container";
import DynamicTabsComponent from "../dynamic-tabs/index.vue";

const props = withDefaults(
  defineProps<{
    viewUrl: string;
    viewProps?: Record<string, any> | string;
    viewName?: string;
  }>(),
  {
    viewProps: () => ({}),
    viewName: "预览页面",
  }
);

const tabsManager = useTabsManager();

const getViewProps = () => {
  if (!props.viewProps) return {};
  if (typeof props.viewProps === "string") {
    try {
      return JSON.parse(props.viewProps);
    } catch {
      return {};
    }
  } else {
    return props.viewProps;
  }
};

onMounted(() => {
  tabsManager.closeTabByAll().then(() => {
    tabsManager.openTab(props.viewUrl, {
      _viewName: props.viewName,
      ...getViewProps(),
    });
  });
});
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
