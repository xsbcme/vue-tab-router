# 快速开始

这一页只完成一件事：让你的工作台能够打开一个页面。先不要急着配置菜单、面包屑、缓存和守卫，这些都可以在最小闭环跑通后逐步加上。

## 在线示例

- 本仓库内置 Demo: [本地演示项目](/views/demo/)

## 安装

```sh
npm install @xsbcme/vue-tab-router
pnpm add @xsbcme/vue-tab-router
yarn add @xsbcme/vue-tab-router
```

也可以通过浏览器脚本直接引入。主插件浏览器包依赖全局 `Vue`，需要先加载 Vue：

```html
<script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
<script src="https://unpkg.com/@xsbcme/vue-tab-router/dist/browser/vue-tab-router.global.js"></script>
<script>
  const { createTabsManager, DynamicTabsComponent, DynamicContainerComponent } = VueTabRouter;
</script>
```

## 1. 创建 TabsManager

```ts
import { createTabsManager } from "@xsbcme/vue-tab-router";

const modules = import.meta.glob("@/views/**/page-index.vue");

const tabsManager = createTabsManager({
  views: {
    modules,
  },
});

export default tabsManager;
```

> `modules` 的 key（例如 `'/src/views/user/page-index.vue'`）就是后续 `openTab(viewUrl)` 的 `viewUrl`。

这里推荐扫描 `page-index.vue`，是为了只注册页面入口，避免把页面内部的表格、弹窗、表单等普通组件都当成可打开页面。

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

如果页面没有打开，先打印 `Object.keys(modules)`，确认传给 `openTab` 的字符串和注册表里的 key 完全一致。

## 组合式与选项式访问

- 组合式：`useTabsManager()`
- 选项式：`this.$tabsManager`

## 下一步

- 还不确定 `viewUrl` 为什么是这个字符串：阅读 [页面入口与 viewUrl](/views/guide/view-url)。
- 已经能打开页面：继续阅读 [基础页面导航](/views/guide/basic-navigation)。
- 想给页面配置默认标题、图标和层级：阅读 [页面元数据与层级](/views/guide/view-meta)。
