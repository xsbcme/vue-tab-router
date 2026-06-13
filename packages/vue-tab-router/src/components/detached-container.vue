<template>
  <teleport to="body">
    <div
      v-if="visible && previewTab"
      class="detached-overlay"
      :class="{ 'is-fullscreen': isFullscreen }"
      :style="{ zIndex: tabsManager.detachedZIndex }"
    >
      <div class="detached-panel" role="dialog" aria-modal="true">
        <div class="detached-header">
          <div class="detached-title">{{ previewTab.viewName || "未命名" }}</div>
          <div class="detached-actions">
            <button
              class="detached-action"
              type="button"
              aria-label="刷新弹窗显示"
              title="刷新弹窗显示"
              @click="refreshPreview"
            >
              <IconRefresh size="14" />
            </button>
            <button
              class="detached-action"
              type="button"
              :aria-label="fullscreenTitle"
              :title="fullscreenTitle"
              @click="toggleFullscreen"
            >
              <IconFullscreen size="14" :fullscreen="isFullscreen" />
            </button>
            <button
              class="detached-action"
              type="button"
              aria-label="关闭弹窗显示"
              title="关闭弹窗显示"
              @click="emit('close')"
            >
              <IconClose size="12" />
            </button>
          </div>
        </div>
        <div class="detached-body">
          <PreviewContainerComponent
            ref="previewRef"
            :view-url="previewTab.viewUrl"
            :view-name="previewTab.viewName || '未命名'"
            :view-props="previewTab.viewProps || {}"
            :source-tab-id="previewTab._id"
            close-source-tab-on-root-close
            @close="handlePreviewClose"
            @error="error => emit('error', error)"
          />
        </div>
      </div>
    </div>
  </teleport>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from "vue";
import type { Tab } from "../tab";
import { useTabsManager } from "../use-tabs-manager";
import IconClose from "./icons/icon-close.vue";
import IconFullscreen from "./icons/icon-fullscreen.vue";
import IconRefresh from "./icons/icon-refresh.vue";
import PreviewContainerComponent from "./preview-container.vue";

const props = defineProps<{
  visible: boolean;
  tab?: Partial<Tab> | null;
}>();

const emit = defineEmits<{
  close: [];
  error: [error: unknown];
}>();

const tabsManager = useTabsManager();
const isFullscreen = ref(tabsManager.detachedFullscreen);
const fullscreenTitle = computed(() => (isFullscreen.value ? "退出全屏显示" : "全屏显示"));
const previewTab = computed<(Partial<Tab> & { viewUrl: string }) | undefined>(() =>
  props.tab?.viewUrl ? { ...props.tab, viewUrl: props.tab.viewUrl } : undefined
);
const previewRef = ref<InstanceType<typeof PreviewContainerComponent>>();

const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value;
};

const refreshPreview = () => {
  previewRef.value?.refresh();
};

const handlePreviewClose = (tabId?: string) => {
  if (tabId && tabsManager.getTabById(tabId)) {
    tabsManager.closeTab(tabId).catch(error => emit("error", error));
    return;
  }
  emit("close");
};

watch(
  () => props.visible,
  visible => {
    if (visible) {
      isFullscreen.value = tabsManager.detachedFullscreen;
    }
  }
);
</script>

<style lang="scss" scoped>
.detached-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: stretch;
  justify-content: center;
  padding: 32px;
  background: rgba(15, 23, 42, 0.42);

  &.is-fullscreen {
    padding: 0;

    .detached-panel {
      width: 100%;
      border: 0;
      border-radius: 0;
      box-shadow: none;
    }
  }
}

.detached-panel {
  display: flex;
  flex-direction: column;
  width: min(1280px, 100%);
  min-width: 0;
  min-height: 0;
  background: var(--tab-color-bg-base, #fff);
  border: 1px solid var(--tab-color-border, #e5e6eb);
  border-radius: var(--tab-radius-md, 6px);
  box-shadow: var(--tab-shadow-large, 0 12px 32px rgba(0, 0, 0, 0.18));
  overflow: hidden;
}

.detached-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  height: 44px;
  padding: 0 12px 0 16px;
  border-bottom: 1px solid var(--tab-color-border, #e5e6eb);
  background: var(--tab-color-bg-elevated, #fff);
}

.detached-title {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--tab-color-text-primary, #1d2129);
  font-size: var(--tab-font-size, 14px);
  font-weight: 500;
}

.detached-actions {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.detached-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border: 0;
  border-radius: var(--tab-radius-sm, 4px);
  background: transparent;
  color: var(--tab-color-text-secondary, #4e5969);
  cursor: pointer;

  &:hover {
    background: var(--tab-color-bg-hover, #f2f3f5);
    color: var(--tab-color-text-primary, #1d2129);
  }
}

.detached-body {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

@media (max-width: 768px) {
  .detached-overlay {
    padding: 12px;
  }
}
</style>
