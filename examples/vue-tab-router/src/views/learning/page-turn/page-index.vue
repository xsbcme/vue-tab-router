<template>
  <div class="workspace-motion-demo">
    <section class="workspace-stage" aria-label="后台工作区切换动画示例">
      <div class="workspace-shell">
        <header class="workspace-toolbar">
          <span />
          <span />
          <span />
        </header>
        <div class="workspace-body">
          <aside class="workspace-rail">
            <span v-for="item in 5" :key="item" />
          </aside>
          <main class="workspace-preview">
            <div class="workspace-header">
              <div>
                <span class="preview-label">Workspace</span>
                <h2>客户运营工作台</h2>
              </div>
              <span class="status-pill">Active</span>
            </div>
            <div class="metric-grid">
              <article v-for="metric in metrics" :key="metric.label" class="metric-card">
                <span>{{ metric.label }}</span>
                <strong>{{ metric.value }}</strong>
              </article>
            </div>
            <div class="preview-table">
              <div v-for="row in 4" :key="row" class="preview-row">
                <span />
                <span />
                <span />
              </div>
            </div>
          </main>
        </div>
      </div>
    </section>

    <aside class="demo-panel">
      <div>
        <p class="eyebrow">Transition</p>
        <h1>后台工作区切换</h1>
        <p class="summary">
          这个页面用于观察全局 tab 切换动效。新效果使用短距离位移、淡入淡出和轻微阴影，节奏更接近后台系统里的工作区切换。
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
          <dt>时长</dt>
          <dd>180ms enter / 140ms leave</dd>
        </div>
        <div>
          <dt>进入</dt>
          <dd>18px 横向滑入</dd>
        </div>
        <div>
          <dt>离开</dt>
          <dd>10px 横向淡出</dd>
        </div>
      </dl>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { useTabsManager } from "@xsbcme/vue-tab-router";

const tabsManager = useTabsManager();
const metrics = [
  { label: "今日线索", value: "128" },
  { label: "待跟进", value: "36" },
  { label: "转化率", value: "18.6%" },
];

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
.workspace-motion-demo {
  min-height: 100%;
  display: grid;
  grid-template-columns: minmax(420px, 1fr) minmax(300px, 380px);
  gap: 16px;
  padding: 18px;
  overflow: hidden;
  color: #1d2129;
  background:
    linear-gradient(135deg, rgba(22, 93, 255, 0.07), transparent 34%),
    linear-gradient(45deg, rgba(20, 201, 201, 0.06), transparent 42%),
    #f5f7fb;
}

  .workspace-stage {
  min-height: 520px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 28px;
  border: 1px solid rgba(78, 89, 105, 0.12);
  border-radius: 8px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.9), rgba(242, 245, 250, 0.9)),
    radial-gradient(circle at 20% 20%, rgba(22, 93, 255, 0.12), transparent 34%);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

.workspace-shell {
  position: relative;
  width: min(760px, 100%);
  min-height: 420px;
  overflow: hidden;
  border: 1px solid rgba(78, 89, 105, 0.16);
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 24px 44px rgba(29, 33, 41, 0.14);
}

.workspace-toolbar {
  display: flex;
  gap: 8px;
  align-items: center;
  height: 44px;
  padding: 0 16px;
  border-bottom: 1px solid rgba(78, 89, 105, 0.1);
  background: #f7f9fc;
}

.workspace-toolbar span {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #c9cdd4;
}

.workspace-body {
  display: grid;
  grid-template-columns: 74px minmax(0, 1fr);
  min-height: 376px;
}

.workspace-rail {
  display: grid;
  align-content: start;
  gap: 12px;
  padding: 18px 16px;
  border-right: 1px solid rgba(78, 89, 105, 0.1);
  background: #fbfcff;
}

.workspace-rail span {
  height: 38px;
  border-radius: 6px;
  background: linear-gradient(135deg, rgba(22, 93, 255, 0.1), rgba(78, 89, 105, 0.08));
}

.workspace-preview {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 22px;
  background:
    linear-gradient(180deg, #fff, #f7f9fc 72%),
    #fff;
}

.workspace-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.workspace-header h2 {
  margin: 0;
  font-size: clamp(22px, 4vw, 32px);
  line-height: 1.18;
  letter-spacing: 0;
}

.preview-label {
  display: block;
  margin-bottom: 8px;
  color: #86909c;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0;
  text-transform: uppercase;
}

.status-pill {
  flex: 0 0 auto;
  padding: 5px 10px;
  border: 1px solid rgba(0, 180, 42, 0.18);
  border-radius: 999px;
  color: #00a82d;
  background: rgba(0, 180, 42, 0.08);
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.metric-card {
  margin: 0;
  padding: 16px;
  border: 1px solid rgba(78, 89, 105, 0.1);
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 8px 18px rgba(29, 33, 41, 0.05);
}

.metric-card span {
  display: block;
  color: #86909c;
}

.metric-card strong {
  display: block;
  margin-top: 10px;
  font-size: 26px;
  line-height: 1;
}

.preview-table {
  display: grid;
  gap: 10px;
  margin-top: auto;
}

.preview-row {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr 0.5fr;
  gap: 14px;
  align-items: center;
  padding: 12px;
  border: 1px solid rgba(78, 89, 105, 0.08);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.78);
}

.preview-row span {
  height: 10px;
  border-radius: 999px;
  background: rgba(78, 89, 105, 0.14);
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
  .workspace-motion-demo {
    grid-template-columns: 1fr;
    overflow: auto;
  }

  .workspace-stage,
  .demo-panel {
    min-height: auto;
  }
}

@media (max-width: 640px) {
  .workspace-motion-demo {
    padding: 10px;
  }

  .workspace-stage {
    padding: 12px;
  }

  .workspace-body {
    grid-template-columns: 1fr;
  }

  .workspace-rail {
    display: none;
  }

  .metric-grid {
    grid-template-columns: 1fr;
  }

  .action-grid {
    grid-template-columns: 1fr;
  }
}
</style>
