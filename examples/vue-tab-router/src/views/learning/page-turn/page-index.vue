<template>
  <div class="page-turn-demo">
    <section class="book-stage" aria-label="页面翻书动画示例">
      <div class="book-spread">
        <article class="paper paper-left">
          <span class="paper-label">Chapter 01</span>
          <h2>页面进入</h2>
          <p>新页面从右侧书脊翻入，前半程带明显的页背暗面，后半程压下纸张并露出内容。</p>
          <div class="paper-lines">
            <span v-for="line in 7" :key="line" />
          </div>
        </article>

        <article class="paper paper-right">
          <span class="paper-label">Chapter 02</span>
          <h2>页面离开</h2>
          <p>旧页面向左翻出，阴影从书脊扫过页面，像纸页被手指带起后离开视野。</p>
          <div class="paper-marks">
            <span v-for="mark in marks" :key="mark">{{ mark }}</span>
          </div>
        </article>
      </div>
    </section>

    <aside class="demo-panel">
      <div>
        <p class="eyebrow">Transition</p>
        <h1>真实页面翻书动画</h1>
        <p class="summary">
          这个页面用于观察全局 tab 切换动效。点击下面的目标页会触发当前页离开和目标页进入，两段动画方向相反、节奏连续。
        </p>
      </div>

      <div class="action-grid">
        <a-button type="primary" @click="openPage('theme')">打开主题与图标</a-button>
        <a-button @click="openPage('state')">打开状态组件</a-button>
        <a-button @click="openPage('workbench')">打开客户工作台</a-button>
        <a-button @click="openPage('report')">打开运营报表</a-button>
      </div>

      <dl class="motion-spec">
        <div>
          <dt>视角</dt>
          <dd>1200px perspective</dd>
        </div>
        <div>
          <dt>进入</dt>
          <dd>右页翻入</dd>
        </div>
        <div>
          <dt>离开</dt>
          <dd>左页翻出</dd>
        </div>
      </dl>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { useTabsManager } from "@xsbcme/vue-tab-router";

const tabsManager = useTabsManager();
const marks = ["fold", "shadow", "spine", "paper"];

const pages = {
  theme: {
    title: "主题与图标",
    url: "/src/views/learning/theme/page-index.vue",
  },
  state: {
    title: "状态组件",
    url: "/src/views/test-theme/state-components/page-index.vue",
  },
  workbench: {
    title: "客户运营工作台",
    url: "/src/views/practice/customer-workbench/page-index.vue",
    props: { _viewSingle: true },
  },
  report: {
    title: "运营复盘报表",
    url: "/src/views/practice/operations-report/page-index.vue",
    props: { _viewSingle: true },
  },
} as const;

const openPage = (key: keyof typeof pages) => {
  const page = pages[key];
  tabsManager.openTab(page.url, {
    _viewName: page.title,
    ...(page.props || {}),
  });
};
</script>

<style scoped>
.page-turn-demo {
  min-height: 100%;
  display: grid;
  grid-template-columns: minmax(420px, 1fr) minmax(300px, 380px);
  gap: 16px;
  padding: 18px;
  overflow: hidden;
  color: #1d2129;
  background:
    linear-gradient(135deg, rgba(38, 126, 240, 0.08), transparent 36%),
    linear-gradient(45deg, rgba(30, 170, 116, 0.08), transparent 42%),
    #f5f7fb;
}

.book-stage {
  min-height: 520px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 28px;
  border: 1px solid rgba(78, 89, 105, 0.12);
  border-radius: 8px;
  background: radial-gradient(circle at center, rgba(255, 255, 255, 0.92), rgba(232, 237, 246, 0.82));
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.8);
  perspective: 1400px;
}

.book-spread {
  position: relative;
  width: min(760px, 100%);
  aspect-ratio: 1.55;
  display: grid;
  grid-template-columns: 1fr 1fr;
  transform-style: preserve-3d;
  filter: drop-shadow(0 26px 34px rgba(29, 33, 41, 0.18));
}

.book-spread::before {
  position: absolute;
  inset: 6% calc(50% - 1px);
  z-index: 3;
  width: 2px;
  background: linear-gradient(to bottom, transparent, rgba(78, 89, 105, 0.34), transparent);
  content: "";
}

.paper {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: clamp(22px, 4vw, 42px);
  overflow: hidden;
  background:
    linear-gradient(90deg, rgba(78, 89, 105, 0.12), transparent 8%),
    repeating-linear-gradient(to bottom, transparent 0 31px, rgba(78, 89, 105, 0.08) 32px),
    #fffdf8;
  border: 1px solid rgba(78, 89, 105, 0.18);
  transform-style: preserve-3d;
}

.paper-left {
  border-radius: 8px 0 0 8px;
  transform: rotateY(1.2deg);
  transform-origin: right center;
}

.paper-right {
  border-radius: 0 8px 8px 0;
  transform: rotateY(-1.2deg);
  transform-origin: left center;
}

.paper::after {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(90deg, rgba(29, 33, 41, 0.18), transparent 20%, transparent 76%, rgba(29, 33, 41, 0.08));
  mix-blend-mode: multiply;
  opacity: 0.52;
  content: "";
}

.paper-label {
  position: relative;
  z-index: 1;
  width: fit-content;
  padding: 4px 8px;
  border: 1px solid rgba(22, 93, 255, 0.18);
  border-radius: 999px;
  color: #165dff;
  font-size: 12px;
  line-height: 1.4;
  background: rgba(22, 93, 255, 0.08);
}

.paper h2,
.paper p,
.paper-lines,
.paper-marks {
  position: relative;
  z-index: 1;
}

.paper h2 {
  margin: 0;
  font-size: clamp(24px, 4vw, 40px);
  line-height: 1.12;
  letter-spacing: 0;
}

.paper p {
  margin: 0;
  max-width: 28em;
  color: #4e5969;
  line-height: 1.8;
}

.paper-lines {
  display: grid;
  gap: 10px;
  margin-top: auto;
}

.paper-lines span {
  height: 9px;
  border-radius: 999px;
  background: linear-gradient(90deg, rgba(78, 89, 105, 0.2), rgba(78, 89, 105, 0.05));
}

.paper-lines span:nth-child(2n) {
  width: 72%;
}

.paper-marks {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-top: auto;
}

.paper-marks span {
  min-width: 0;
  padding: 10px 12px;
  border: 1px solid rgba(30, 170, 116, 0.18);
  border-radius: 6px;
  color: #0b7f5a;
  background: rgba(30, 170, 116, 0.08);
}

.demo-panel {
  min-height: 520px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 18px;
  padding: 24px;
  border: 1px solid rgba(78, 89, 105, 0.12);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.88);
  box-shadow: 0 14px 30px rgba(29, 33, 41, 0.08);
}

.eyebrow {
  margin: 0 0 8px;
  color: #165dff;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0;
  text-transform: uppercase;
}

.demo-panel h1 {
  margin: 0;
  font-size: clamp(26px, 4vw, 38px);
  line-height: 1.16;
  letter-spacing: 0;
}

.summary {
  margin: 14px 0 0;
  color: #4e5969;
  line-height: 1.8;
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.action-grid :deep(.arco-btn) {
  min-width: 0;
}

.motion-spec {
  display: grid;
  gap: 10px;
  margin: 0;
}

.motion-spec div {
  display: grid;
  grid-template-columns: 64px minmax(0, 1fr);
  gap: 12px;
  padding: 12px;
  border: 1px solid rgba(78, 89, 105, 0.1);
  border-radius: 6px;
  background: #f7f9fc;
}

.motion-spec dt {
  color: #86909c;
}

.motion-spec dd {
  min-width: 0;
  margin: 0;
  color: #1d2129;
}

@media (max-width: 980px) {
  .page-turn-demo {
    grid-template-columns: 1fr;
    overflow: auto;
  }

  .book-stage,
  .demo-panel {
    min-height: auto;
  }
}

@media (max-width: 640px) {
  .page-turn-demo {
    padding: 10px;
  }

  .book-stage {
    padding: 12px;
  }

  .book-spread {
    grid-template-columns: 1fr;
    aspect-ratio: auto;
  }

  .book-spread::before {
    display: none;
  }

  .paper-left,
  .paper-right {
    min-height: 260px;
    border-radius: 8px;
    transform: none;
  }

  .paper-right {
    margin-top: -1px;
  }

  .action-grid {
    grid-template-columns: 1fr;
  }
}
</style>
