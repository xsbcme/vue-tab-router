# 本地演示项目

当前仓库已内置演示项目：`packages/demo`。它由原 `vue-tab-router-demo` 迁移而来，用于展示插件在后台工作台中的完整接入方式。

## 启动

```sh
pnpm install
pnpm dev:demo
```

也可以只针对 demo 包运行：

```sh
pnpm --filter @xsbcme/demo dev
```

## 构建

```sh
pnpm build:demo
```

## 菜单结构

Demo 菜单采用“能力域聚合面板”的方式组织。左侧菜单不再把每个细功能都作为入口，而是进入聚合页后通过按钮、状态面板和日志完成多场景验证。

| 菜单入口      | Demo 位置                                       | 覆盖能力                                                                                                                      |
| ------------- | ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| API 覆盖检查  | `src/views/test-api/overview`                   | 导出 API 总览、运行状态、菜单 key、主题变量、存储状态                                                                         |
| 导航与缓存    | `src/views/test-workbench/navigation-cache`     | `openTab`、`openFirstTab`、`activeFirstTab`、单例、多例、组件缓存、不缓存、刷新、更新、关闭、批量关闭、清空、交换标签         |
| 通信与守卫    | `src/views/test-workbench/communication-guards` | `defineTabEvents`、`emit`、页面级进入/离开/关闭守卫、全局守卫日志、插件 hook 日志                                             |
| 链接与 Iframe | `src/views/test-iframe/message`                 | 内部链接、外部链接、相对链接、iframe 缓存、不缓存、`postIframeMessage`、`postActiveIframeMessage`、`postCurrentIframeMessage` |
| 插件与主题    | `src/views/test-theme/icons`                    | `plugins`、`TabsManagerHooks`、`DynamicIconComponent`、`DynamicTabsComponent`、`applyTheme`                                   |
| 项目实践      | `src/views/practice/test-table-detail`          | 表格打开详情、多页面来源链路、业务场景接入                                                                                    |

## 测试目标页

以下页面主要由聚合面板打开，不再直接挂到左侧菜单中：

| 功能            | Demo 位置                                | 对应能力                                                   |
| --------------- | ---------------------------------------- | ---------------------------------------------------------- |
| 首页标签        | `src/views/home/page-index.vue`          | `openFirstTab`、`activeFirstTab`                           |
| 单例页面        | `src/views/test-router/router-single`    | `_viewSingle`                                              |
| 多开页面        | `src/views/test-router/router-no-single` | `viewProps` 区分多实例                                     |
| 组件缓存控制    | `src/views/test-cache`                   | `_viewNoCache`、keep-alive                                 |
| 刷新页面        | `src/views/test-refresh`                 | `refreshTab`                                               |
| 更新页签        | `src/views/test-update`                  | `updateTabOptions`                                         |
| 关闭页签        | `src/views/test-close`                   | `closeTab`                                                 |
| 父子通信        | `src/views/test-message`                 | `defineTabEvents`、`emit`                                  |
| 页面守卫        | `src/views/test-guard`                   | `onBeforeTabEnter`、`onBeforeTabLeave`、`onBeforeTabClose` |
| 菜单联动        | `src/layouts/container`                  | `useTabMenu`、`selectedKeys`、相同链接 key 区分            |
| 预览容器        | `src/views/test-preview/container`       | `PreviewContainerComponent`，需单独预览场景，不挂主菜单    |
| Vue Router 集成 | `src/plugins/vue-router`                 | 登录页/工作台分层                                          |

## 项目结构

```txt
packages/demo
├─src
│  ├─plugins
│  │  ├─tab-router      # createTabsManager 配置
│  │  ├─vue-router      # 顶层路由与登录鉴权
│  │  └─store           # Pinia 状态
│  ├─layouts/container  # 工作台布局、菜单、标签栏、内容区
│  └─views              # 可打开的页面入口
├─vite.config.ts
└─package.json
```

Demo 依赖工作区内的 `@xsbcme/vue-tab-router`，因此修改插件源码后重新构建即可在 demo 中验证。
