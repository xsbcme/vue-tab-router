# VueTabRouter

一个专注于 Vue 3 的多标签页路由插件，适用于后台管理系统、工作台、多文档编辑等场景。

## 特性

- **页面管理**：支持组件页面与 iframe 页面统一管理，打开、切换、关闭、刷新能力完整
- **行为可控**：支持单例/多开、缓存控制（keep-alive）、页面级守卫与全局守卫
- **通信与扩展**：支持父子页签事件通信、存储适配器与插件扩展机制
- **Vue 生态**：Composition API、TypeScript 友好，可与 Vue Router 协同

## 应用优势

VueTabRouter 面向中后台系统中常见的多标签工作台场景，不只是提供一个标签栏 UI，而是提供一套围绕页面生命周期的标签页路由管理能力。它将页面打开、复用、缓存、刷新、关闭、守卫、持久化、iframe 承载、菜单联动和页面通信收敛到统一的 `TabsManager` 中，减少业务项目中分散维护的状态和胶水代码。

- **统一页面入口**：组件页、iframe 页、外链页和相对链接页都可以通过 `openTab()` 打开，业务侧不需要为不同页面类型拆分多套逻辑。
- **适配后台工作台体验**：支持首页、置顶、多开、单例复用、批量关闭、刷新、不可关闭、禁止拖拽等后台系统常用交互。
- **页面状态保留更完整**：组件页面支持 keep-alive 缓存，iframe 页面也支持独立缓存，适合报表、第三方系统、低代码页面和历史系统嵌入。
- **业务流程可拦截**：打开、进入、离开、关闭 tab 都支持守卫，可用于未保存表单确认、权限校验、关闭前确认等场景。
- **导航状态更容易同步**：提供菜单联动、面包屑、URL 同步和页面元数据能力，降低菜单选中、tab 激活、页面层级之间状态不一致的问题。
- **扩展边界清晰**：通过插件 hooks、事件通信、存储适配器和 scoped manager 支持项目级扩展，也支持预览容器、弹窗容器等临时标签组隔离。

如果项目只是简单页面跳转，Vue Router 已经足够；如果系统需要浏览器式多标签工作台，并且要处理缓存、iframe、菜单联动、守卫和页面间通信，VueTabRouter 可以把这些复杂度集中在一套可复用的插件能力中。

## 与后台基础框架的关系

许多中控台或后台基础框架已经内置多标签页能力，适合从零搭建完整后台项目。VueTabRouter 的定位不是替代这些完整框架，而是将多标签工作台能力抽象为独立插件，适合已有 Vue 项目按需接入。

相比完整后台模板，VueTabRouter 更关注多标签页运行时本身：页面打开与复用、组件与 iframe 缓存、关闭与切换守卫、菜单和面包屑联动、URL 状态同步、页面间通信、插件扩展和临时 scoped manager。它不强绑定具体 UI 库、菜单协议、权限模型或工程模板，默认标签栏只是开箱即用的 UI，业务也可以基于 `TabsManager` 自行渲染标签栏。

因此，如果项目需要完整后台脚手架，可以选择成熟中控台框架；如果项目已有技术栈和业务框架，只是缺少一套稳定、可组合、可复用的多标签工作台内核，VueTabRouter 更适合作为独立基础能力接入。

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
