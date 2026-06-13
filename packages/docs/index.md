---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "VueTabRouter"
  text: "为 Vue 3 工作台而生的多标签页路由插件"
  tagline: 把页面打开、缓存、关闭守卫、iframe 集成和菜单联动收敛成一套稳定的工作台运行时。
  image:
    src: /images/logo.png
    alt: VueTabRouter
  actions:
    - theme: brand
      text: 快速上手
      link: /views/guide/getting-started
    - theme: alt
      text: API 总览
      link: /views/api/
    - theme: alt
      text: Demo 案例
      link: /views/demo/

features:
  - title: 统一页面运行时
    details: 组件页面、iframe 页面、外链和相对地址都可以通过 openTab 进入同一套打开、切换、刷新和关闭流程。
  - title: 浏览器式工作台体验
    details: 支持首页、置顶、不可关闭、单例复用、多开并存、拖拽排序和批量关闭，适合高频业务操作。
  - title: 缓存与现场保留
    details: 组件 keep-alive 与 iframe 缓存协同工作，让列表、详情、审批和报表页面在切换后保留上下文。
  - title: 守卫与事件通信
    details: 打开、进入、离开、关闭全链路可拦截，页面之间也能围绕来源页签进行消息传递。
  - title: 菜单与面包屑联动
    details: useTabMenu、页面元信息和动态面包屑让菜单选中、标签标题和页面层级保持一致。
  - title: 插件化扩展
    details: 存储适配器、URL 同步、主题变量、生命周期 hooks 和 scoped manager 便于融入已有后台系统。
---

## 适合什么项目？

VueTabRouter 适合已经有 Vue 3 技术栈、业务菜单和页面体系，但还缺少多标签工作台内核的项目。它不强绑定 UI 组件库、权限模型或后台模板，可以渐进接入到现有系统中。

| 场景              | 可以解决的问题                                                         |
| ----------------- | ---------------------------------------------------------------------- |
| 后台管理系统      | 在列表、详情、审批、配置等页面之间频繁切换，并保留每个页面的现场。     |
| 业务工作台        | 统一管理多个业务上下文，支持首页、置顶、批量关闭和来源页签关系。       |
| 报表与旧系统集成  | 将 BI 报表、低代码页面、第三方平台或历史系统作为 iframe 页签纳入管理。 |
| 多文档/多任务界面 | 允许同一页面单例复用或多开并存，适配编辑、预览、对比等任务流。         |

## 你会得到什么？

### 一套标签页运行时

`TabsManager` 负责维护 tabs 列表、当前激活页、页面打开参数、关闭策略、刷新状态和来源关系。业务侧只需要围绕 `openTab(viewUrl, options)` 组织页面入口，复杂行为由运行时统一处理。

```ts
tabsManager.openTab("/src/views/order/page-index.vue", {
  _viewName: "订单详情",
  orderId: 1001,
});
```

### 开箱即用的容器组件

内置 `DynamicTabsComponent` 和 `DynamicContainerComponent` 可以直接组成工作台布局；如果项目已有设计系统，也可以消费 `TabsManager` 自行渲染标签栏。

```vue
<template>
  <DynamicTabsComponent />
  <DynamicContainerComponent />
</template>
```

### 可持续扩展的工程接口

当业务继续增长，可以逐步接入页面元信息、菜单联动、面包屑、URL 同步、iframe 通信、自定义存储、插件 hooks 和 scoped manager，而不用推翻最初的接入方式。

## 推荐阅读路径

| 目标                     | 阅读                                                   |
| ------------------------ | ------------------------------------------------------ |
| 先跑起来                 | [快速开始](/views/guide/getting-started)               |
| 理解页面入口和 `viewUrl` | [页面模块与元数据](/views/guide/view-meta)             |
| 接入菜单选中状态         | [菜单联动](/views/guide/menu-integration)              |
| 处理缓存与刷新           | [页面缓存控制](/views/guide/cache-control)             |
| 控制关闭、切换和通信     | [页面事件通信与守卫](/views/guide/events-and-guards)   |
| 嵌入报表或旧系统         | [Iframe 通信与缓存](/views/guide/iframe-communication) |
| 查询完整 API             | [API 总览](/views/api/)                                |

## 最小接入步骤

1. 使用 `import.meta.glob` 注册可被工作台打开的页面入口。
2. 创建并安装 `TabsManager`。
3. 在布局中放置标签栏和页面容器。
4. 从菜单、按钮或业务动作中调用 `openTab` 打开页面。
5. 按需增加缓存、守卫、菜单联动、URL 同步和插件扩展。

```ts
const tabsManager = createTabsManager({
  views: {
    modules: import.meta.glob("@/views/**/page-index.vue"),
  },
});
```

准备接入时，从 [快速开始](/views/guide/getting-started) 进入；想直接看效果，可以打开 [Demo 案例](/views/demo/)。
