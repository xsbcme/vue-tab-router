# VueTabRouter Demo

这是 `@xsbcme/vue-tab-router` 的本地演示项目，已作为 workspace 子包迁移到当前仓库。

## 启动

```bash
pnpm install
pnpm dev:demo
```

或直接运行当前包：

```bash
pnpm --filter @xsbcme/demo dev
```

## 构建

```bash
pnpm build:demo
```

## 演示功能

| 功能            | 路径                  | 说明                          |
| --------------- | --------------------- | ----------------------------- |
| 单例模式        | 路由测试 / 单例模式   | 同一页面只保留一个标签        |
| 多例模式        | 路由测试 / 多例模式   | 同一页面可打开多个标签        |
| 缓存启用        | 缓存测试 / 缓存启用   | 默认启用 keep-alive           |
| 缓存关闭        | 缓存测试 / 缓存关闭   | `_viewNoCache: true` 禁用缓存 |
| 刷新页面        | 刷新当前页            | `refreshTab()`                |
| 更新参数        | 更新当前页            | `updateTabOptions()`          |
| 关闭页面        | 关闭当前页            | `closeTab()`                  |
| 父子通信        | 父子通信              | `defineTabEvents` + `emit`    |
| 离开守卫        | 守卫测试 / 离开页面前 | `onBeforeTabLeave`            |
| 关闭守卫        | 守卫测试 / 关闭页面前 | `onBeforeTabClose`            |
| Vue Router 集成 | 登录页 / 工作台       | 顶层路由与页签管理分层        |

## 结构

```txt
packages/demo
├─src
│  ├─plugins
│  │  ├─tab-router
│  │  ├─vue-router
│  │  └─store
│  ├─layouts/container
│  └─views
└─vite.config.ts
```

Demo 依赖工作区内的 `@xsbcme/vue-tab-router`，无需再从 npm 安装旧版本插件。
