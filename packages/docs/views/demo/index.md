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

启动后进入登录页，任意填写账号、密码、验证码即可登录。Demo 会打开首页 tab 并跳转到工作台。

如果启用了地址栏同步插件，登录后 URL 会带上当前激活 tab 状态，例如：

```txt
/#/dashboard?activeTab=...
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
| 链接与 Iframe | `src/views/test-iframe/message`                 | 内部链接、外部链接、相对链接、iframe 缓存、不缓存、hash 加载验证、`postIframeMessage`、`postActiveIframeMessage`、`postCurrentIframeMessage` |
| 插件与主题    | `src/views/test-theme/icons`                    | `plugins`、`TabsManagerHooks`、`DynamicIconComponent`、`DynamicTabsComponent`、`applyTheme`                                   |
| 状态组件      | `src/views/test-theme/state-components`         | 默认 loading、error、empty、not-found 组件，自定义状态组件配置                                                              |
| 项目实践      | `src/views/practice/test-table-detail`          | 表格打开详情、多页面来源链路、业务场景接入                                                                                    |

## 建议验证路径

### 1. 验证基础标签页

进入“导航与缓存”：

1. 点击打开单例页面，重复点击应复用同一个 tab。
2. 点击打开多开页面，携带不同参数时会出现多个 tab。
3. 点击刷新当前页，观察页面重新渲染。
4. 点击批量关闭，验证首页不可关闭。

### 2. 验证页面元数据和面包屑

进入“项目实践”：

1. 从表格打开项目详情。
2. 观察面包屑显示 `测试工作台 / 项目实践 / 项目详情`。
3. 点击“项目实践”，应返回上级页面。
4. 不需要在左侧菜单中配置“项目详情”，层级来自 `views.meta`。

### 3. 验证 URL 同步

切换任意 tab 后观察地址栏：

```txt
/#/dashboard?activeTab=...
```

刷新页面后，插件会从 `activeTab` 参数恢复当前 tab。浏览器前进/后退会在历史里的激活 tab 间切换。

### 4. 验证浏览器标题同步

切换 tab 后，浏览器标签页标题会更新为：

```txt
页面标题 - Vue Tab Router Demo
```

对应配置位于 `packages/demo/src/plugins/tab-router/index.ts`。

### 5. 验证 iframe 通信

进入“链接与 Iframe”：

1. 打开相对 iframe 页面。
2. 在 iframe 内触发消息发送。
3. 观察宿主日志区是否出现 message 记录。
4. 使用宿主按钮向当前 iframe 发送消息。
5. 打开 hash 加载验证页，确认加载完成后不会停留在加载状态，且 hash 导航仍触发 iframe load 日志。

### 6. 验证守卫和 hooks

进入“通信与守卫”：

1. 打开页面级守卫示例。
2. 尝试切换或关闭 tab。
3. 观察全局守卫日志和插件 hook 日志。

### 7. 验证默认状态组件

进入“状态组件”：

1. 查看内置 loading、error、empty、not-found 四类状态组件的默认视觉。
2. 使用页面内预览区切换自定义状态组件，验证 `render.*Component` 覆盖效果。

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
| 状态组件        | `src/views/test-theme/state-components`  | 默认状态组件和自定义状态组件配置                           |
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

## 常见问题

### pnpm run dev 启动失败？

仓库根目录可能没有直接配置 `dev` 脚本，建议使用明确的 demo 命令：

```sh
pnpm --filter @xsbcme/demo dev
```

或查看根目录 `package.json` 中当前可用脚本。

### 改了核心包但 demo 没变化？

demo 依赖工作区包。建议重新执行：

```sh
pnpm --filter @xsbcme/vue-tab-router build
pnpm --filter @xsbcme/demo dev
```

### 登录后没有恢复上次 tab？

检查 `sessionStorage` 中是否还有 tabs 数据，以及 URL 中是否有 `activeTab` 参数。退出登录时 demo 会清空 tab 状态。
