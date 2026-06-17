<template>
  <article class="page-panel">
    <p class="eyebrow">custom match</p>
    <h2>订单 {{ route.params.id }}</h2>
    <p>当前详情标签的 match key 来自 `{ name, id }`，所以不同订单号会生成不同标签。</p>
    <dl class="detail-list">
      <div>
        <dt>订单号</dt>
        <dd>{{ route.params.id }}</dd>
      </div>
      <div>
        <dt>当前路径</dt>
        <dd>{{ route.fullPath }}</dd>
      </div>
    </dl>
  </article>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";

const route = useRoute();
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

.detail-list {
  display: grid;
  gap: 12px;
  margin-top: 20px;
}

.detail-list div {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  border: 1px solid #dbe7df;
  border-radius: 6px;
  padding: 14px;
  background: #f8fbf9;
}

.detail-list dt {
  color: #6a7d72;
  font-size: 13px;
}

.detail-list dd {
  margin: 6px 0 0;
  color: #173328;
  font-weight: 700;
}

@media (max-width: 820px) {
  .detail-list div {
    grid-template-columns: 1fr;
  }
}
</style>
