<template>
  <a-card :style="{ height: '100%', overflow: 'auto' }" title="长内容滚动测试">
    <div class="long-content-page">
      <a-alert type="info">
        这个页面用于验证组件页内容超过容器高度时，DynamicContainerComponent 的内容层可以滚动查看完整内容。
      </a-alert>

      <a-card v-for="item in items" :key="item" :title="`内容块 ${item}`">
        <p>当前内容块用于撑高页面。打开这个页面后，应当可以在内容区域滚动到底部，而不是被容器外层隐藏。</p>
        <a-descriptions :column="{ xs: 1, sm: 1, md: 2 }" bordered>
          <a-descriptions-item label="序号">{{ item }}</a-descriptions-item>
          <a-descriptions-item label="时间">{{ now }}</a-descriptions-item>
          <a-descriptions-item label="说明">组件页面长内容滚动</a-descriptions-item>
          <a-descriptions-item label="容器">DynamicContainerComponent</a-descriptions-item>
        </a-descriptions>
      </a-card>

      <a-card title="底部标记">
        <a-result status="success" title="已经滚动到底部" subtitle="如果能看到这里，说明组件页长内容没有被容器隐藏。" />
      </a-card>
    </div>
  </a-card>
</template>

<script setup lang="ts">
const items = Array.from({ length: 18 }, (_, index) => index + 1);
const now = new Date().toLocaleTimeString();
</script>

<style scoped>
.long-content-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 100%;
}

@media (max-width: 768px) {
  .long-content-page {
    gap: 10px;
  }
}
</style>
