# 入门约定

这一页只讲接入前最容易卡住的约定：工作台放在哪里、页面入口怎么命名、`viewUrl` 从哪里来。先知道这些，再去做 [快速开始](/views/guide/getting-started) 会轻松很多。

## 工作台区域

`VueTabRouter` 通常只管理登录后的某个业务区域，而不是整个站点。常见分层是：

- `VueRouter` 负责 `/login`、`/dashboard` 这类顶层路由。
- `VueTabRouter` 负责工作台内部的标签页、缓存、刷新、关闭和页面通信。

例如用户进入 `/dashboard` 后，页面中间的工作区放置 `DynamicTabsComponent` 和 `DynamicContainerComponent`。之后菜单点击、按钮跳转、详情打开都调用 `openTab(viewUrl, options)`。

## 推荐目录结构

```txt
src
├─layouts
│  └─workbench
│     └─index.vue      # 放置 DynamicTabsComponent / DynamicContainerComponent
├─plugins
│  └─tab-router.ts     # createTabsManager
└─views
   ├─user
   │  ├─page-index.vue # 页面入口组件（建议）
   │  └─parts/*
   └─order
      └─page-index.vue
```

## 为什么推荐 `page-index.vue`

`modules` 通常写成：

```ts
const modules = import.meta.glob("@/views/**/page-index.vue");
```

这样可以只把“真正页面入口”注册为可打开页签，避免把局部业务组件误当成页面。

## `viewUrl` 的来源

- `viewUrl` 不是浏览器地址，而是 `modules` 的 key
- 例如模块 key 为 `'/src/views/user/page-index.vue'`
- 那么应通过 `openTab('/src/views/user/page-index.vue')` 打开
- 第一次接入时，先打印 `Object.keys(modules)`，用真实生成的 key 打开页面

最小接入只需要知道：`views.modules` 里有什么 key，`openTab` 就用同一个 key。更完整的解释见 [页面入口与 viewUrl](/views/guide/view-url)。

## 多业务模块项目

`import.meta.glob()` 的参数必须是项目真实路径或已配置的 Vite 别名。跨模块页面建议在聚合 `modules` 时统一加模块名前缀。

例如同项目多业务模块可以按真实目录扫描，然后把 key 规范化为业务模块前缀：

```ts
const salesViews = import.meta.glob("./modules/sales/views/**/page-index.vue");
const crmViews = import.meta.glob("./modules/crm/views/**/page-index.vue");

const modules = {
  ...normalizeViewKeys(salesViews, "sales", "./modules/sales/"),
  ...normalizeViewKeys(crmViews, "crm", "./modules/crm/"),
};
```

这样菜单、`views.meta` 和 `openTab()` 都可以使用类似 `@sales/views/user/page-index.vue` 的稳定 key。

## 何时使用内置标签组件

- 你想快速落地：直接使用 `DynamicTabsComponent`
- 你已有设计系统：只用 `tabsManager.tabs` 自己渲染标签栏

两种方式都使用同一套核心状态与 API。

下一步进入 [快速开始](/views/guide/getting-started)，先把标签栏和内容区跑起来。
