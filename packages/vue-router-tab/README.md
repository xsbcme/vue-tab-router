# Vue Router Tab

`@xsbcme/vue-router-tab` 是 `@xsbcme/vue-tab-router` 的 Vue Router 适配包，适合已经以 Vue Router 路由表组织页面的项目。它把路由记录转换为标签页描述，让业务侧可以用 route-first 的方式获得多标签、缓存、守卫、刷新、关闭和持久化能力。

## 安装

```bash
pnpm add @xsbcme/vue-router-tab vue-router
```

适配包会把底层 `@xsbcme/vue-tab-router` 作为依赖带入，Vue Router 场景不需要在应用里显式安装核心包。适配包也会转发核心包的公开 API，因此可以统一从 `@xsbcme/vue-router-tab` 导入 `createTabsManager`、`useTabsManager`、`StorageAdapter`、`DynamicTabsComponent` 等能力。

## 快速开始

### 1. 创建 Vue Router

```ts
import { createRouter, createWebHashHistory } from "vue-router";
import WorkbenchLayout from "./layouts/workbench/index.vue";
import OverviewPage from "./views/overview-page.vue";

export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: "/workbench",
      component: WorkbenchLayout,
      children: [
        {
          path: "overview",
          name: "overview",
          component: OverviewPage,
          meta: {
            tab: {
              title: "工作台总览",
              pinned: true,
              closable: false,
            },
          },
        },
      ],
    },
  ],
});
```

### 2. 创建 TabsManager

```ts
import { createTabsManager, createVueRouterTabsPlugin, StorageAdapter } from "@xsbcme/vue-router-tab";
import { router } from "./router";

export const tabsManager = createTabsManager({
  views: {
    modules: {},
  },
  storage: {
    adapter: new StorageAdapter(sessionStorage),
    key: "router-tabs",
  },
  plugins: [
    createVueRouterTabsPlugin(router, {
      include: route => route.meta.tab !== false,
    }),
  ],
});
```

### 3. 注册插件

```ts
import { createApp } from "vue";
import App from "./App.vue";
import { router } from "./router";
import { tabsManager } from "./tabs-manager";

createApp(App).use(router).use(tabsManager).mount("#app");
```

### 4. 在工作台布局中渲染容器

```vue
<template>
  <RouterTabsContainer />
</template>

<script setup lang="ts">
import { RouterTabsContainer } from "@xsbcme/vue-router-tab";
</script>
```

## Route Meta

适配包优先读取 `route.meta.tab` 作为标签页配置：

```ts
{
  path: "orders/:id",
  name: "order-detail",
  component: OrderDetailPage,
  meta: {
    tab: {
      title: route => `订单 ${String(route.params.id)}`,
      match: route => ({ name: route.name, id: route.params.id }),
      keepAlive: true,
    },
  },
}
```

常用字段：

- `title`：标签标题，支持字符串或函数。
- `icon`：标签图标，支持字符串或函数。
- `match`：标签复用规则，可按路由记录、路径或自定义 key 复用。
- `keepAlive`：是否保留组件状态。
- `pinned`：是否固定标签。
- `closable`：是否允许关闭。
- `viewUrl`：自定义底层 tab viewUrl，默认使用适配包内置的路由视图容器。

标签展示信息建议收敛在 `route.meta.tab` 中；业务页面 props 使用 Vue Router 路由记录自身的 `props` 配置，不需要放进 `meta.tab`。

如果某个路由不希望进入标签页，可设置：

```ts
meta: {
  tab: false,
}
```

## 组件与组合式 API

```ts
import {
  RouterTabsContainer,
  RouterTabsLink,
  RouterTabsView,
  createVueRouterTabsPlugin,
  useRouterTabs,
  useRouterTabRoute,
  useRouterTabNavigation,
  useTabsManager,
} from "@xsbcme/vue-router-tab";
```

## 示例

本仓库提供独立示例项目：

```bash
pnpm dev:router-tab-demo
pnpm build:router-tab-demo
```

源码位于 `examples/vue-router-tab`，包含登录页、工作台布局、路由菜单、route meta 配置和标签页同步示例。
