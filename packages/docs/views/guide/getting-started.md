# 快速开始

## 在线示例

- 本仓库内置 Demo: [本地演示项目](/views/demo/)

## 安装

```sh
npm install @xsbcme/vue-tab-router
pnpm add @xsbcme/vue-tab-router
yarn add @xsbcme/vue-tab-router
```

## 1. 创建 TabsManager

```ts
import { createTabsManager } from "@xsbcme/vue-tab-router";

const modules = import.meta.glob("@/views/**/page-index.vue");

const tabsManager = createTabsManager({
  views: {
    modules,
  },
  render: {
    viewNameMaxLength: 20,
  },
});

export default tabsManager;
```

> `modules` 的 key（例如 `'/src/views/user/page-index.vue'`）就是后续 `openTab(viewUrl)` 的 `viewUrl`。

这里推荐使用 `import.meta.glob`，是因为 Vite 可以按文件约定自动生成页面入口注册表。`VueTabRouter` 并不强依赖 Vite；非 Vite 项目也可以手写或生成同样结构的 `modules`。推荐扫描 `page-index.vue`，是为了只注册页面入口，避免把页面内部的表格、弹窗、表单等普通组件都当成可打开页面。

`import.meta.glob()` 的扫描表达式必须是当前项目真实可解析的相对路径、绝对路径或 Vite 别名。多模块、依赖包页面聚合、key 规范化等架构约定，请先阅读 [页面模块与元数据](/views/guide/view-meta) 中关于页面入口注册表和 `viewUrl` key 的说明。

如果希望统一配置页面标题、图标、默认单例策略或详情页层级，可以继续配置 `views.meta`。完整说明见 [页面模块与元数据](/views/guide/view-meta)。

## 2. 在布局中放置容器

```vue
<template>
  <div class="layout">
    <DynamicTabsComponent />
    <DynamicContainerComponent />
  </div>
</template>

<script setup lang="ts">
import { DynamicTabsComponent, DynamicContainerComponent } from "@xsbcme/vue-tab-router";
</script>
```

`DynamicContainerComponent` 决定当前激活页签渲染到哪里；没有它，页签状态会存在，但页面不会展示。

## 3. 注册插件并挂载应用

```ts
import { createApp } from "vue";
import App from "./App.vue";
import tabsManager from "./plugins/tab-router";

createApp(App).use(tabsManager).mount("#app");
```

## 4. 在业务里打开页面

```ts
import { useTabsManager } from "@xsbcme/vue-tab-router";

const tabsManager = useTabsManager();

tabsManager.openTab("/src/views/about/page-index.vue", {
  _viewName: "关于页面",
  userId: 1001,
});
```

## 组合式与选项式访问

- 组合式：`useTabsManager()`
- 选项式：`this.$tabsManager`

下一步建议阅读 [基础页面导航](/views/guide/basic-navigation)、[页面模块与元数据](/views/guide/view-meta) 和 [页面缓存控制](/views/guide/cache-control)。
