<template>
  <a-card :style="{ height: '100%', overflow: 'auto' }" title="预览容器测试">
    <a-space direction="vertical" fill>
      <a-alert
        >此页嵌套 PreviewContainer，目标页会作为隐藏首页打开；目标页继续打开其他页面后，上方标签栏才出现。</a-alert
      >
      <a-descriptions :column="1" bordered>
        <a-descriptions-item label="主实例标签数">{{ tabsManager.tabs.length }}</a-descriptions-item>
        <a-descriptions-item label="主实例当前标签">{{
          tabsManager.activeTab?.viewName || tabsManager.activeTab?.viewUrl || "-"
        }}</a-descriptions-item>
        <a-descriptions-item label="预览目标">{{ previewTarget.viewName }}</a-descriptions-item>
        <a-descriptions-item label="预览参数时间">{{ time }}</a-descriptions-item>
      </a-descriptions>
      <a-space wrap>
        <a-button type="primary" @click="switchPreviewTarget">切换预览目标</a-button>
        <a-button @click="refreshPreviewProps">刷新预览参数</a-button>
        <a-button @click="openMainInterferenceTab">主实例打开干扰页</a-button>
      </a-space>
      <div class="preview-demo">
        <PreviewContainerComponent
          :view-url="previewTarget.viewUrl"
          :view-name="previewTarget.viewName"
          :view-props="{ preview: true, time, target: previewTarget.key }"
          @error="handleError"
        />
      </div>
    </a-space>
  </a-card>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { Message } from "@arco-design/web-vue";
import { PreviewContainerComponent, useTabsManager } from "@xsbcme/vue-tab-router";

const time = ref(Date.now());
const tabsManager = useTabsManager();
const previewTargetIndex = ref(0);

const previewTargets = [
  {
    key: "target",
    viewName: "预览目标页",
    viewUrl: "/src/views/test-router/router-target/page-index.vue",
  },
  {
    key: "update",
    viewName: "预览更新页",
    viewUrl: "/src/views/test-update/page-index.vue",
  },
];

const previewTarget = computed(() => previewTargets[previewTargetIndex.value]);

const refreshPreviewProps = () => {
  time.value = Date.now();
};

const switchPreviewTarget = () => {
  previewTargetIndex.value = (previewTargetIndex.value + 1) % previewTargets.length;
  refreshPreviewProps();
};

const openMainInterferenceTab = () => {
  tabsManager.openTab("/src/views/test-router/router-target/page-index.vue", {
    _viewName: `主实例干扰 ${new Date().toLocaleTimeString()}`,
    source: "preview-demo-main",
  });
};

const handleError = (error: unknown) => {
  Message.error(error instanceof Error ? error.message : "预览容器打开失败");
};
</script>

<style scoped>
.preview-demo {
  height: 520px;
  border: 1px solid var(--color-border);
}
</style>
