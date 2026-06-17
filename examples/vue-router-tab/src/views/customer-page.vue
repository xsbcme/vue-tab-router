<template>
  <article class="page-panel">
    <p class="eyebrow">record match</p>
    <h2>客户工作台</h2>
    <p>这个页面使用默认 record 复用。重复点击左侧“客户工作台”不会新增标签，只会激活已有标签。</p>
    <div class="table-card">
      <div v-for="item in customers" :key="item.name" class="table-row">
        <span>{{ item.name }}</span>
        <strong>{{ item.stage }}</strong>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
const customers = [
  { name: "Acme Cloud", stage: "续约中" },
  { name: "Northwind", stage: "方案评估" },
  { name: "Blue Lake", stage: "已成交" },
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

.table-card {
  display: grid;
  gap: 12px;
  margin-top: 20px;
}

.table-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  border: 1px solid #dbe7df;
  border-radius: 6px;
  padding: 14px;
  background: #f8fbf9;
}

.table-row strong {
  display: block;
  margin-bottom: 4px;
  color: #173328;
  font-size: 22px;
}

@media (max-width: 820px) {
  .table-row {
    grid-template-columns: 1fr;
  }
}
</style>
