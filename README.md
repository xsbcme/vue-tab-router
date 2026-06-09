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
import { createApp } from "vue";
import App from "./App.vue";
import { createTabsManager } from "@xsbcme/vue-tab-router";

const modules = import.meta.glob("./views/**/page-index.vue");
const tabsManager = createTabsManager({
  views: {
    modules,
  },
});

createApp(App).use(tabsManager).mount("#app");
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
import { DynamicTabsComponent, DynamicContainerComponent } from "@xsbcme/vue-tab-router";
</script>
```

### 3. 打开页面

```ts
import { useTabsManager } from "@xsbcme/vue-tab-router";

const tabsManager = useTabsManager();
tabsManager.openTab("/views/user/page-index.vue", { _viewName: "用户管理" });
```

### SSR / 非浏览器环境

VueTabRouter 默认面向浏览器运行。包本身可以在 SSR 或 Node 环境导入；如果需要在服务端创建 `TabsManager`，建议关闭持久化，或传入不会访问 `window` / `document` / `sessionStorage` 的自定义 `storage.adapter`。

```ts
const tabsManager = createTabsManager({
  views: {
    modules,
  },
  storage: {
    enabled: false,
  },
});
```

## 项目结构

```
vue-tab-router/
├── packages/
│   ├── vue-tab-router/   # 核心插件包 @xsbcme/vue-tab-router
│   ├── docs/             # VitePress 文档站点
│   └── demo/             # 本地演示项目
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

| 命令               | 说明                      |
| ------------------ | ------------------------- |
| `pnpm install`     | 安装依赖                  |
| `pnpm build`       | 构建所有包                |
| `pnpm dev`         | 启动所有开发任务          |
| `pnpm dev:demo`    | 启动本地 demo             |
| `pnpm build:demo`  | 构建本地 demo             |
| `pnpm type-check`  | 运行类型检查              |
| `pnpm release:change` | 编写发布变更日志       |
| `pnpm release:beta` | 准备 beta 版本与文档日志 |
| `pnpm release:latest` | 准备正式版本与文档日志 |

### 文档

本地开发文档：

```bash
pnpm dev
```

访问 VitePress 站点查看完整指南与 API 文档。

## 发布包

发布由 changesets 生成插件包版本和包内日志，再同步到文档日志页。npm 发布通过 GitHub Actions 手动触发，不在仓库中保存 npm token。

changesets 只用于 `@xsbcme/vue-tab-router` 插件包。docs、demo、Pages、构建脚本等外层改动可以随版本提交，但不要写入 changeset 发布日志；`pnpm changeset:check` 会阻止非插件包日志进入发布流程。

### 发布 beta

```bash
pnpm release:change
pnpm release:beta
git add .
git commit -m "chore: prepare beta release"
git push
```

推送后到 GitHub Actions 运行 `Release NPM`，选择 `beta`。

beta 版本处于 changesets pre mode 时，npm dist-tag 会由 `.changeset/pre.json` 自动使用 `beta`，发布脚本不会额外传 `--tag beta`。

### 发布正式版

```bash
pnpm release:change
pnpm release:latest
git add .
git commit -m "chore: prepare stable release"
git push
```

推送后到 GitHub Actions 运行 `Release NPM`，选择 `latest`。

### 发布命令

| 命令 | 说明 |
| ---- | ---- |
| `pnpm release:change` | 编写 changeset 变更说明 |
| `pnpm release:beta` | 进入 beta 通道、生成版本、同步文档日志 |
| `pnpm release:latest` | 退出预发布通道、生成正式版本、同步文档日志 |
| `pnpm release:check` | 检查 changeset 范围、文档日志、类型和测试 |

`pnpm changeset:check`、`pnpm changelog:sync` 和 `pnpm changelog:check` 是底层命令，通常不需要直接使用；发布准备脚本会自动检查日志范围并同步文档日志。

### GitHub 配置

- 在 `npm-beta` 和 `npm-latest` environment secrets 中配置 `NPM_TOKEN`。
- 建议给 `npm-latest` 配置 required reviewers。
- workflow 会校验版本号和发布标签，`1.0.0-beta.x` 只能发布到 `beta`，正式版本只能发布到 `latest`。

## 部署文档与 Demo

项目采用 GitHub Pages 合并部署：根目录只保留入口页，VitePress 文档放到 `doc/`，Demo 放到 `demo/`。

访问路径：

- 入口页：`https://xsbcme.github.io/vue-tab-router/`
- 文档首页：`https://xsbcme.github.io/vue-tab-router/doc/`
- 在线 Demo：`https://xsbcme.github.io/vue-tab-router/demo/`

本地构建 Pages 产物：

```bash
pnpm build:pages -- --base /vue-tab-router/
```

构建产物位于 `dist/pages`。推送到 `main` 或 `master` 后，GitHub Actions 会自动构建并发布该目录。首次启用时，需要在 GitHub 仓库 `Settings -> Pages` 中将部署来源设置为 `GitHub Actions`。

## 链接

- **NPM 包**：[@xsbcme/vue-tab-router](https://www.npmjs.com/package/@xsbcme/vue-tab-router)
- **Demo 案例**：`packages/demo`
