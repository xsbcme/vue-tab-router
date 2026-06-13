# 入门约定

这一页介绍与 `VueTabRouter` 强相关的目录与命名约定，能显著降低接入成本。

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
- `import.meta.glob()` 的参数必须是项目真实路径或已配置的 Vite 别名；跨模块页面建议在聚合 `modules` 时统一加模块名前缀

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
