<template>
  <article class="page-panel">
    <p class="eyebrow">route list</p>
    <h2>订单中心</h2>
    <p>列表页复用一个标签，详情页通过自定义 match 按订单号多开。</p>
    <div class="action-row">
      <RouterTabsLink to="/workbench/orders/A1024">打开 A1024</RouterTabsLink>
      <RouterTabsLink to="/workbench/orders/B2048">打开 B2048</RouterTabsLink>
      <RouterTabsLink to="/workbench/orders/C4096">打开 C4096</RouterTabsLink>
    </div>
  </article>
</template>

<script setup lang="ts">
import { RouterTabsLink } from "@xsbcme/vue-router-tab";
</script>

<style scoped lang="scss">
.page-panel {
  min-height: 100%;
  border: 1px solid #d5e0d9;
  border-radius: 8px;
  padding: 22px;
  background: #ffffff;
}

.eyebrow {
  margin: 0 0 8px;
  color: #2f8f68;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.page-panel h2 {
  margin: 0 0 8px;
  font-size: 26px;
}

.page-panel p {
  max-width: 720px;
  color: #52675d;
  line-height: 1.7;
}

.action-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-top: 20px;
}

.action-row a {
  border: 1px solid #bacbc1;
  border-radius: 6px;
  padding: 8px 12px;
  color: #173328;
  background: #ffffff;
}

.action-row a:hover {
  border-color: #2f8f68;
  color: #146044;
}

@media (max-width: 820px) {
  .action-row {
    grid-template-columns: 1fr;
  }
}
</style>
