# 快速开始

## 在线示例

- Demo: [vue-tab-router-demo](https://gitee.com/xsbcme/vue-tab-router-demo)

## 安装

```sh
npm install @xsbcme/vue-tab-router
pnpm add @xsbcme/vue-tab-router
yarn add @xsbcme/vue-tab-router
```

## 1. 创建 TabsManager

```ts
import { createTabsManager } from '@xsbcme/vue-tab-router';

const modules = import.meta.glob('@/views/**/page-index.vue');

const tabsManager = createTabsManager({
  modules,
  viewNameMaxLength: 20,
});

export default tabsManager;
```

> `modules` 的 key（例如 `'/src/views/user/page-index.vue'`）就是后续 `openTab(viewUrl)` 的 `viewUrl`。

## 2. 在布局中放置容器

```vue
<template>
  <div class="layout">
    <DynamicTabsComponent />
    <DynamicContainerComponent />
  </div>
</template>

<script setup lang="ts">
import {
  DynamicTabsComponent,
  DynamicContainerComponent,
} from '@xsbcme/vue-tab-router';
</script>
```

`DynamicContainerComponent` 决定当前激活页签渲染到哪里；没有它，页签状态会存在，但页面不会展示。

## 3. 注册插件并挂载应用

```ts
import { createApp } from 'vue';
import App from './App.vue';
import tabsManager from './plugins/tab-router';

createApp(App).use(tabsManager).mount('#app');
```

## 4. 在业务里打开页面

```ts
import { useTabsManager } from '@xsbcme/vue-tab-router';

const tabsManager = useTabsManager();

tabsManager.openTab('/src/views/about/page-index.vue', {
  _viewName: '关于页面',
  userId: 1001
});
```

## 组合式与选项式访问

- 组合式：`useTabsManager()`
- 选项式：`this.$tabsManager`

下一步建议阅读 [基础页面导航](/views/guide/basic-navigation) 和 [页面缓存控制](/views/guide/cache-control)。