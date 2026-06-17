<template>
  <article class="page-panel hero-panel">
    <p class="eyebrow">router-first</p>
    <h2>路由就是标签入口</h2>
    <p>点击左侧路由会先完成 vue-router 导航，再由适配层同步打开标签页。点击标签页也会回写当前路由。</p>
    <div class="metric-grid">
      <section>
        <strong>record</strong>
        <span>同一业务页复用标签</span>
      </section>
      <section>
        <strong>params</strong>
        <span>详情页按参数多开</span>
      </section>
      <section>
        <strong>path</strong>
        <span>报表按路径复用</span>
      </section>
    </div>
  </article>
</template>

<style scoped lang="scss">
.page-panel {
  min-height: 100%;
  border: 1px solid #d5e0d9;
  border-radius: 8px;
  padding: 22px;
  background: #ffffff;
}

.hero-panel {
  background: linear-gradient(135deg, rgba(142, 225, 180, 0.22), transparent 34%), #ffffff;
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

.metric-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-top: 20px;
}

.metric-grid section {
  border: 1px solid #dbe7df;
  border-radius: 6px;
  padding: 14px;
  background: #f8fbf9;
}

.metric-grid strong {
  display: block;
  margin-bottom: 4px;
  color: #173328;
  font-size: 22px;
}

@media (max-width: 820px) {
  .metric-grid {
    grid-template-columns: 1fr;
  }
}
</style>
