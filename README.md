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
| `pnpm publish:run` | 构建后使用 changeset 发布 |

### 文档

本地开发文档：

```bash
pnpm dev
```

访问 VitePress 站点查看完整指南与 API 文档。

## 发布包

### 前置条件

1. **npm 账号**：在 [npmjs.com](https://www.npmjs.com) 注册并登录
2. **2FA 双重认证**：npm 要求发布时必须启用 2FA（账号设置 → Two-Factor Authentication）
3. **登录**：在终端执行 `npm login`，输入用户名、密码和邮箱

### 方式一：使用 Changeset（推荐）

适用于有版本说明、需要变更日志的正式发布：

```bash
# 1. 构建
pnpm build

# 2. 创建变更集（按提示选择要发布的包和版本类型）
pnpm changeset

# 3. 应用版本变更
pnpm changeset version

# 4. 发布到 npm
pnpm changeset publish
```

或直接使用组合命令：

```bash
pnpm publish:run
```

### 方式二：直接发布

若已手动修改版本号，可跳过 changeset：

```bash
cd packages/vue-tab-router
pnpm build
pnpm publish --registry="https://registry.npmjs.org/" --access public
```

### 发布 Beta 版本

```bash
pnpm publish:pre-beta
pnpm publish:bump
pnpm publish:run
```

会进入 beta 通道，发布形如 `1.0.0-beta.0` 的版本。

### 注意事项

- 作用域包 `@xsbcme/vue-tab-router` 需 `--access public` 才能发布为公开包
- 若使用 Granular Access Token 替代 2FA，需勾选「Allow bypassing 2FA for publishing」
- 确认 `.npmrc` 中 registry 指向 `https://registry.npmjs.org/`（若使用镜像需临时改回）

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
