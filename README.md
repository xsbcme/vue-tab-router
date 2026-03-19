# VueTabRouter

一个专注于 Vue 3 的多标签页路由插件，适用于后台管理系统、工作台、多文档编辑等场景。

## 特性

- **页面管理**：支持组件页面与 iframe 页面统一管理，打开、切换、关闭、刷新能力完整
- **行为可控**：支持单例/多开、缓存控制（keep-alive）、页面级守卫与全局守卫
- **通信与扩展**：支持父子页签事件通信、存储适配器与插件扩展机制
- **Vue 生态**：Composition API、TypeScript 友好，可与 Vue Router 协同

## 安装

```bash
pnpm add @xsbcme/vue-tab-router
# 或
npm install @xsbcme/vue-tab-router
yarn add @xsbcme/vue-tab-router
```

## 快速开始

### 1. 创建 TabsManager

```ts
import { createApp } from 'vue';
import App from './App.vue';
import { createTabsManager } from '@xsbcme/vue-tab-router';

const modules = import.meta.glob('./views/**/page-index.vue');
const tabsManager = createTabsManager({ modules });

createApp(App).use(tabsManager).mount('#app');
```

### 2. 布局中放置容器

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

### 3. 打开页面

```ts
import { useTabsManager } from '@xsbcme/vue-tab-router';

const tabsManager = useTabsManager();
tabsManager.openTab('/views/user/page-index.vue', { _viewName: '用户管理' });
```

## 项目结构

```
vue-tab-router/
├── packages/
│   ├── vue-tab-router/   # 核心插件包 @xsbcme/vue-tab-router
│   └── docs/             # VitePress 文档站点
├── pnpm-workspace.yaml
├── turbo.json
└── package.json
```

本仓库为 monorepo，使用 pnpm workspace + Turborepo 管理。

## 开发指南

### 环境要求

- Node.js >= 18
- pnpm >= 8

### 常用命令

| 命令 | 说明 |
|------|------|
| `pnpm install` | 安装依赖 |
| `pnpm build` | 构建所有包 |
| `pnpm build:plugin` | 仅构建 vue-tab-router |
| `pnpm dev` | 启动开发（构建依赖包后启动 docs） |
| `pnpm publish` | 发布（需配置 changeset） |
| `pnpm publish:beta` | 发布 beta 版本 |

### 文档

本地开发文档：

```bash
pnpm dev
```

访问 VitePress 站点查看完整指南与 API 文档。

## 链接

- **NPM 包**：[@xsbcme/vue-tab-router](https://www.npmjs.com/package/@xsbcme/vue-tab-router)
- **Demo 案例**：[vue-tab-router-demo](https://gitee.com/xsbcme/vue-tab-router-demo)

## License

ISC
