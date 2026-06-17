<template>
  <article class="page-panel">
    <p class="eyebrow">path match / no cache</p>
    <h2>{{ route.params.period }} 运营报表</h2>
    <p>这个路由使用 path 复用，并关闭 keepAlive，用来验证适配层能把 route meta 映射到核心 tab 参数。</p>
    <div class="report-grid">
      <section v-for="item in metrics" :key="item.label">
        <span>{{ item.label }}</span>
        <strong>{{ item.value }}</strong>
      </section>
    </div>
  </article>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";

const route = useRoute();
const metrics = [
  { label: "新增客户", value: "128" },
  { label: "成交订单", value: "43" },
  { label: "转化率", value: "18.6%" },
];
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

.report-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-top: 20px;
}

.report-grid section {
  border: 1px solid #dbe7df;
  border-radius: 6px;
  padding: 14px;
  background: #f8fbf9;
}

.report-grid strong {
  display: block;
  margin-bottom: 4px;
  color: #173328;
  font-size: 22px;
}

@media (max-width: 820px) {
  .report-grid {
    grid-template-columns: 1fr;
  }
}
</style>
