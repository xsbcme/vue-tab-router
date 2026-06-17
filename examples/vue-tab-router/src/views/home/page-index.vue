<template>
  <div class="home-page">
    <section class="hero-section">
      <div class="hero-copy">
        <div class="hero-kicker">
          <IconApps />
          Vue 3 多标签页路由插件
        </div>
        <h1>Vue Tab Router</h1>
        <p class="hero-desc">
          面向后台管理系统、工作台和多文档编辑场景，把路由、标签页、缓存、守卫和 iframe 编排成一套稳定的页面工作流。
        </p>
        <div class="hero-actions">
          <a-button type="primary" size="large" @click="openWorkbench">
            <template #icon><IconDashboard /></template>
            开始渐进演示
          </a-button>
          <a-button size="large" @click="openApiOverview">
            <template #icon><IconCode /></template>
            API 覆盖检查
          </a-button>
        </div>
      </div>

      <div class="workspace-preview" aria-label="Vue Tab Router 工作台预览">
        <div class="preview-bar">
          <div class="preview-dot is-red"></div>
          <div class="preview-dot is-yellow"></div>
          <div class="preview-dot is-green"></div>
          <span>tab-router.workspace</span>
        </div>
        <div class="preview-tabs">
          <div
            v-for="tab in previewTabs"
            :key="tab"
            class="preview-tab"
            :class="{ 'is-active': tab === '客户运营工作台' }"
          >
            {{ tab }}
          </div>
        </div>
        <div class="preview-body">
          <div class="preview-panel">
            <div class="panel-title">页面状态</div>
            <div class="state-row" v-for="item in stateRows" :key="item.label">
              <span>{{ item.label }}</span>
              <strong>{{ item.value }}</strong>
            </div>
          </div>
          <div class="preview-panel is-main">
            <div class="panel-title">能力编排</div>
            <div class="flow-list">
              <div v-for="item in flowItems" :key="item.title" class="flow-item">
                <component :is="item.icon" />
                <div>
                  <strong>{{ item.title }}</strong>
                  <span>{{ item.desc }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="metrics-section">
      <div v-for="metric in metrics" :key="metric.label" class="metric-card">
        <span>{{ metric.label }}</span>
        <strong>{{ metric.value }}</strong>
        <em>{{ metric.desc }}</em>
      </div>
    </section>

    <section class="feature-section">
      <div v-for="feature in features" :key="feature.title" class="feature-card">
        <div class="feature-icon">
          <component :is="feature.icon" />
        </div>
        <div>
          <h2>{{ feature.title }}</h2>
          <p>{{ feature.desc }}</p>
        </div>
      </div>
    </section>

    <section class="scan-section">
      <div class="section-heading">
        <div>
          <span>自动扫描结果</span>
          <h2>已注册页面清单</h2>
        </div>
        <strong>{{ tabsManager.registerTabPaths.length }} views</strong>
      </div>
      <div class="scan-layout">
        <div class="scan-groups">
          <div v-for="group in scanGroups" :key="group.name" class="scan-group">
            <span>{{ group.name }}</span>
            <strong>{{ group.count }}</strong>
            <em>{{ group.desc }}</em>
          </div>
        </div>
        <div class="scan-list">
          <div class="scan-list-header">
            <span>菜单入口</span>
            <span>viewUrl</span>
          </div>
          <button
            v-for="view in featuredScanViews"
            :key="view.path"
            class="scan-row"
            type="button"
            @click="openScannedView(view)"
          >
            <span>{{ view.title }}</span>
            <code>{{ view.path }}</code>
          </button>
        </div>
        <div class="path-list">
          <div class="path-list-title">扫描样本</div>
          <code v-for="path in visibleScanPaths" :key="path">{{ path }}</code>
        </div>
      </div>
    </section>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import {
  IconApps,
  IconBranch,
  IconCode,
  IconDashboard,
  IconLink,
  IconRefresh,
  IconSafe,
  IconStorage,
  IconThunderbolt,
} from "@arco-design/web-vue/es/icon";
import { useTabsManager } from "@xsbcme/vue-tab-router";

const tabsManager = useTabsManager();

interface ScannedView {
  title: string;
  path: string;
}

const previewTabs = ["首页", "客户运营工作台", "订单详情 #A1024", "iframe 看板"];

const stateRows = [
  { label: "已注册视图", value: tabsManager.registerTabPaths.length },
  { label: "当前标签", value: tabsManager.tabs.length },
  { label: "缓存策略", value: "KeepAlive" },
];

const flowItems = [
  { title: "打开与复用", desc: "单例、多例、首页替换和批量关闭", icon: IconBranch },
  { title: "状态保留", desc: "切换、刷新和回到页面时保持业务上下文", icon: IconStorage },
  { title: "守卫与通信", desc: "进入、离开、关闭、iframe 消息和来源页回传", icon: IconSafe },
];

const metrics = [
  { label: "核心模块", value: "9+", desc: "标签、菜单、守卫、缓存、URL 同步" },
  { label: "示例场景", value: "20+", desc: "覆盖后台工作台常见交互" },
  { label: "目标框架", value: "Vue 3", desc: "组合式 API 与 TypeScript 优先" },
  { label: "集成方式", value: "Plugin", desc: "按项目路由体系渐进接入" },
];

const features = [
  { title: "多标签路由", desc: "把菜单、路由和标签页生命周期放在同一套模型里管理。", icon: IconDashboard },
  { title: "缓存控制", desc: "支持页面级缓存、刷新重建、无缓存对照和状态恢复。", icon: IconRefresh },
  { title: "URL 同步", desc: "标签状态可同步到地址栏，刷新和分享时能恢复上下文。", icon: IconLink },
  { title: "工程友好", desc: "提供组件、组合式函数、插件扩展点和类型工具。", icon: IconThunderbolt },
];

const moduleLabels: Record<string, string> = {
  home: "首页",
  practice: "项目实践",
  "test-api": "API 覆盖",
  "test-cache": "缓存验证",
  "test-close": "关闭守卫",
  "test-detached": "弹窗显示",
  "test-guard": "导航守卫",
  "test-iframe": "Iframe",
  "test-message": "通信",
  "test-plugin": "插件 Hook",
  "test-preview": "预览",
  "test-refresh": "刷新",
  "test-router": "路由",
  "test-theme": "主题",
  "test-update": "更新",
  "test-workbench": "工作台",
  learning: "渐进演示",
};

const scanGroups = computed(() => {
  const groupMap = tabsManager.registerTabPaths.reduce((map, path) => {
    const moduleName = getModuleName(path);
    map.set(moduleName, (map.get(moduleName) || 0) + 1);
    return map;
  }, new Map<string, number>());

  return [...groupMap.entries()]
    .sort((current, next) => next[1] - current[1])
    .slice(0, 6)
    .map(([moduleName, count]) => ({
      name: moduleLabels[moduleName] || formatModuleName(moduleName),
      count,
      desc: moduleName,
    }));
});

const featuredScanViews = computed<ScannedView[]>(() =>
  tabsManager.registerTabPaths
    .map(path => ({ path, meta: tabsManager.getViewMeta(path) }))
    .filter(item => item.meta?.title)
    .slice(0, 7)
    .map(item => ({
      title: item.meta?.title || formatViewName(item.path),
      path: item.path,
    }))
);

const visibleScanPaths = computed(() =>
  tabsManager.registerTabPaths.filter(path => !tabsManager.getViewMeta(path)?.title).slice(0, 10)
);

const openWorkbench = () => {
  tabsManager.openTab("/src/views/learning/start/page-index.vue", {
    _viewName: "最小打开页面",
    _viewSingle: true,
  });
};

const openApiOverview = () => {
  tabsManager.openTab("/src/views/learning/api-check/page-index.vue", {
    _viewName: "API 覆盖检查",
    _viewSingle: true,
  });
};

const openScannedView = (view: ScannedView) => {
  tabsManager.openTab(view.path, {
    _viewName: view.title,
    _viewSingle: true,
  });
};

function getModuleName(path: string) {
  return path.match(/\/src\/views\/([^/]+)/)?.[1] || "other";
}

function formatModuleName(moduleName: string) {
  return moduleName
    .split("-")
    .filter(Boolean)
    .map(item => item.charAt(0).toUpperCase() + item.slice(1))
    .join(" ");
}

function formatViewName(path: string) {
  const segments = path.replace("/src/views/", "").replace("/page-index.vue", "").split("/");
  return segments.map(formatModuleName).join(" / ");
}
</script>

<style lang="scss" scoped>
.home-page {
  min-height: 100%;
  padding: 20px;
  overflow: auto;
  color: #1d2129;
  background:
    radial-gradient(circle at 14% 12%, rgba(0, 180, 160, 0.16), transparent 30%),
    radial-gradient(circle at 86% 6%, rgba(255, 125, 0, 0.14), transparent 28%),
    linear-gradient(135deg, #f6f8fb 0%, #eef6f5 48%, #f8f4ed 100%);
}

.hero-section {
  display: grid;
  grid-template-columns: minmax(0, 0.92fr) minmax(460px, 1.08fr);
  gap: 22px;
  align-items: stretch;
}

.workspace-preview,
.metric-card,
.feature-card {
  border: 1px solid rgba(201, 205, 212, 0.72);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.86);
  box-shadow: 0 16px 36px rgba(29, 33, 41, 0.08);
}

.hero-copy {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 330px;
  padding: 20px 20px 20px 8px;
}

.hero-kicker {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  width: fit-content;
  padding: 7px 12px;
  color: #007f73;
  font-weight: 600;
  background: rgba(0, 180, 160, 0.1);
  border: 1px solid rgba(0, 180, 160, 0.24);
  border-radius: 999px;
}

h1 {
  margin: 20px 0 14px;
  font-size: 54px;
  line-height: 1;
  letter-spacing: 0;
}

.hero-desc {
  max-width: 660px;
  margin: 0;
  color: #4e5969;
  font-size: 18px;
  line-height: 1.75;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 26px;
}

.workspace-preview {
  min-width: 0;
  min-height: 330px;
  overflow: hidden;
}

.preview-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 44px;
  padding: 0 16px;
  color: #6b7785;
  font-size: 13px;
  border-bottom: 1px solid #e5e6eb;
  background: #fbfcfd;
}

.preview-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.is-red {
  background: #f76560;
}

.is-yellow {
  background: #ffb400;
}

.is-green {
  background: #00b42a;
}

.preview-tabs {
  display: flex;
  gap: 6px;
  box-sizing: border-box;
  width: calc(100% - 28px);
  min-width: 0;
  max-width: 100%;
  margin: 12px 14px 0;
  padding: 0 0 8px;
  overflow-x: auto;
  overflow-y: hidden;
  overscroll-behavior-x: contain;
  -webkit-overflow-scrolling: touch;
}

.preview-tabs::after {
  flex: 0 0 8px;
  content: "";
}

.preview-tab {
  flex: 0 0 auto;
  min-width: 0;
  max-width: 100%;
  padding: 8px 12px;
  overflow: hidden;
  color: #4e5969;
  font-size: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
  background: #f2f3f5;
  border: 1px solid #e5e6eb;
  border-bottom: none;
  border-radius: 6px 6px 0 0;
}

.preview-tab.is-active {
  color: #007f73;
  font-weight: 600;
  background: #fff;
}

.preview-body {
  display: grid;
  grid-template-columns: 0.78fr 1.22fr;
  gap: 14px;
  padding: 16px;
}

.preview-panel {
  min-height: 210px;
  padding: 16px;
  border: 1px solid #e5e6eb;
  border-radius: 8px;
  background: #fff;
}

.preview-panel.is-main {
  background: linear-gradient(180deg, #ffffff 0%, #f6fbfa 100%);
}

.panel-title {
  margin-bottom: 14px;
  color: #1d2129;
  font-weight: 700;
}

.state-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 13px 0;
  color: #4e5969;
  border-bottom: 1px solid #f2f3f5;
}

.state-row strong {
  color: #007f73;
  font-size: 18px;
}

.flow-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.flow-item {
  display: grid;
  grid-template-columns: 36px minmax(0, 1fr);
  gap: 12px;
  align-items: center;
  padding: 12px;
  background: rgba(0, 180, 160, 0.08);
  border: 1px solid rgba(0, 180, 160, 0.16);
  border-radius: 8px;
}

.flow-item svg {
  color: #007f73;
  font-size: 24px;
}

.flow-item strong,
.flow-item span {
  display: block;
}

.flow-item span {
  margin-top: 4px;
  color: #4e5969;
  font-size: 13px;
  line-height: 1.5;
}

.metrics-section {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin-top: 14px;
}

.metric-card {
  padding: 16px;
}

.metric-card span,
.metric-card em {
  display: block;
  color: #6b7785;
  font-style: normal;
}

.metric-card strong {
  display: block;
  margin: 8px 0;
  color: #1d2129;
  font-size: 30px;
  line-height: 1;
}

.metric-card em {
  font-size: 13px;
  line-height: 1.5;
}

.feature-section {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin-top: 14px;
}

.feature-card {
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr);
  gap: 14px;
  padding: 18px;
}

.feature-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  color: #fff;
  background: #007f73;
  border-radius: 8px;
}

.feature-icon svg {
  font-size: 22px;
}

.feature-card h2 {
  margin: 0 0 6px;
  font-size: 16px;
  line-height: 1.4;
}

.feature-card p {
  margin: 0;
  color: #4e5969;
  font-size: 13px;
  line-height: 1.65;
}

.scan-section {
  margin-top: 14px;
  padding: 20px;
  border: 1px solid rgba(201, 205, 212, 0.72);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 16px 36px rgba(29, 33, 41, 0.08);
}

.section-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.section-heading span {
  display: block;
  margin-bottom: 4px;
  color: #007f73;
  font-size: 13px;
  font-weight: 700;
}

.section-heading h2 {
  margin: 0;
  font-size: 24px;
  line-height: 1.2;
}

.section-heading strong {
  color: #007f73;
  font-size: 22px;
  white-space: nowrap;
}

.scan-layout {
  display: grid;
  grid-template-columns: 0.8fr 1.28fr 1fr;
  gap: 14px;
}

.scan-groups {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.scan-group {
  padding: 14px;
  border: 1px solid #e5e6eb;
  border-radius: 8px;
  background: #fbfcfd;
}

.scan-group span,
.scan-group em {
  display: block;
  color: #6b7785;
  font-style: normal;
}

.scan-group strong {
  display: block;
  margin: 7px 0 4px;
  color: #1d2129;
  font-size: 24px;
  line-height: 1;
}

.scan-group em {
  font-size: 12px;
}

.scan-list,
.path-list {
  overflow: hidden;
  border: 1px solid #e5e6eb;
  border-radius: 8px;
  background: #fff;
}

.scan-list-header,
.scan-row {
  display: grid;
  grid-template-columns: 116px minmax(0, 1fr);
  gap: 12px;
  align-items: center;
}

.scan-list-header {
  padding: 10px 12px;
  color: #6b7785;
  font-size: 12px;
  font-weight: 700;
  background: #f7f8fa;
  border-bottom: 1px solid #e5e6eb;
}

.scan-row {
  width: 100%;
  padding: 10px 12px;
  color: #1d2129;
  text-align: left;
  background: transparent;
  border: 0;
  border-bottom: 1px solid #f2f3f5;
  cursor: pointer;
}

.scan-row:hover {
  background: rgba(0, 180, 160, 0.08);
}

.scan-row span {
  overflow: hidden;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.scan-row code,
.path-list code {
  overflow: hidden;
  color: #4e5969;
  font-family: Consolas, Monaco, monospace;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.path-list {
  padding: 12px;
}

.path-list-title {
  margin-bottom: 10px;
  color: #1d2129;
  font-weight: 700;
}

.path-list code {
  display: block;
  padding: 7px 0;
  border-bottom: 1px solid #f2f3f5;
}

@media (max-width: 1120px) {
  .hero-section,
  .metrics-section,
  .feature-section,
  .scan-layout {
    grid-template-columns: 1fr 1fr;
  }

  .hero-copy,
  .workspace-preview {
    min-height: auto;
  }
}

@media (max-width: 768px) {
  .home-page {
    padding: 10px;
  }

  .hero-section,
  .metrics-section,
  .feature-section,
  .preview-body,
  .scan-layout,
  .scan-groups {
    grid-template-columns: 1fr;
  }

  .section-heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .scan-list-header,
  .scan-row {
    grid-template-columns: 1fr;
    gap: 4px;
  }

  .hero-copy {
    padding: 24px;
  }

  h1 {
    font-size: 38px;
  }

  .hero-desc {
    font-size: 15px;
  }

  .hero-actions :deep(.arco-btn) {
    flex: 1 1 150px;
  }

  .preview-tabs {
    width: calc(100% - 20px);
    margin-inline: 10px;
  }

  .preview-tab {
    padding: 8px 10px;
  }
}
</style>
