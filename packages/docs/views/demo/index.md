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

## 覆盖的能力

| 功能            | Demo 位置                                | 对应能力                               |
| --------------- | ---------------------------------------- | -------------------------------------- |
| 首页标签        | `src/views/home/page-index.vue`          | `openFirstTab`、`activeFirstTab`       |
| 单例页面        | `src/views/test-router/router-single`    | `_viewSingle`                          |
| 多开页面        | `src/views/test-router/router-no-single` | `viewProps` 区分多实例                 |
| 缓存控制        | `src/views/test-cache`                   | `_viewNoCache`、keep-alive             |
| 刷新页面        | `src/views/test-refresh`                 | `refreshTab`                           |
| 更新页签        | `src/views/test-update`                  | `updateTabOptions`                     |
| 关闭页签        | `src/views/test-close`                   | `closeTab`                             |
| 父子通信        | `src/views/test-message`                 | `defineTabEvents`、`emit`              |
| 页面守卫        | `src/views/test-guard`                   | `onBeforeTabLeave`、`onBeforeTabClose` |
| Vue Router 集成 | `src/plugins/vue-router`                 | 登录页/工作台分层                      |

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
