<template>
  <a-card :style="{ height: '100%', overflow: 'auto' }" title="预览容器测试">
    <a-space direction="vertical" fill>
      <a-alert>此页嵌套 PreviewContainer，目标页会作为隐藏首页打开；目标页继续打开其他页面后，上方标签栏才出现。</a-alert>
      <div class="preview-demo">
        <PreviewContainerComponent
          view-url="/src/views/test-router/router-target/page-index.vue"
          view-name="首页"
          :view-props="{ preview: true, time }"
          @error="handleError"
        />
      </div>
    </a-space>
  </a-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Message } from '@arco-design/web-vue';
import { PreviewContainerComponent } from '@xsbcme/vue-tab-router';

const time = ref(Date.now());

const handleError = (error: unknown) => {
  Message.error(error instanceof Error ? error.message : '预览容器打开失败');
};
</script>

<style scoped>
.preview-demo {
  height: 520px;
  border: 1px solid var(--color-border);
}
</style>
