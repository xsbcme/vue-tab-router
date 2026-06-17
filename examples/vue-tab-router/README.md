# VueTabRouter Demo

这是 `@xsbcme/vue-tab-router` 的核心能力示例项目，位于 `examples/vue-tab-router`。示例按“从简单到复杂”的学习路径组织，左侧菜单会先演示最小打开页面，再逐步进入缓存、守卫、iframe、弹窗、插件和综合业务场景。

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

## 渐进式演示路线

| 菜单入口      | 代表页面                             | 演示重点                                |
| ------------- | ------------------------------------ | --------------------------------------- |
| 最小入门      | `src/views/learning/start`           | 最小 `openTab` 闭环、`viewUrl` 和目标页 |
| 基础操作      | `src/views/learning/basic-open`      | 单例复用、多开、刷新、更新、关闭、缓存  |
| 菜单与层级    | `src/views/learning/menu-breadcrumb` | 菜单入口、非菜单详情页、面包屑层级      |
| 通信与守卫    | `src/views/learning/events`          | 父子 tab 通信、进入/离开/关闭守卫       |
| 链接与 Iframe | `src/views/learning/iframe-links`    | 链接打开、iframe 缓存、消息、导航同步   |
| 弹窗与预览    | `src/views/learning/detached`        | 弹窗显示、预览容器、独立 manager        |
| 扩展与外观    | `src/views/learning/plugin-hooks`    | 插件 hooks、主题、动态图标、状态组件    |
| 项目实践      | `src/views/practice/overview`        | 业务工作台、列表详情、报表、组合能力    |
| API 覆盖检查  | `src/views/learning/api-check`       | 维护者检查清单和状态组件入口            |

## 建议验证路径

1. 进入“最小入门 / 最小打开页面”，点击打开目标页，确认标签栏和内容区正常工作。
2. 进入“基础操作”，依次验证打开复用、当前页操作、缓存对照、批量与排序。
3. 进入“菜单与层级”，打开订单中心和订单详情，观察面包屑来源。
4. 进入“通信与守卫”，验证子页回传事件和页面守卫拦截。
5. 进入“链接与 Iframe”，按链接打开、缓存、消息、导航同步逐步验证。
6. 进入“弹窗与预览”和“扩展与外观”，验证弹窗、预览、插件 hook 和主题能力。
7. 最后进入“项目实践”和“API 覆盖检查”，做综合业务和维护者覆盖检查。

## 结构

```txt
examples/vue-tab-router
├─src
│  ├─plugins
│  │  ├─tab-router
│  │  ├─vue-router
│  │  └─store
│  ├─layouts/container
│  └─views
│     ├─learning       # 渐进式演示页
│     ├─practice       # 综合业务实践
│     └─test-*         # 渐进式页面调用的目标页
└─vite.config.ts
```

Demo 依赖工作区内的 `@xsbcme/vue-tab-router`，无需再从 npm 安装旧版本插件。
