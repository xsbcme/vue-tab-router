# 页面模块与元数据

`views.modules` 负责告诉 `VueTabRouter` 有哪些页面可以被打开，`views.meta` 负责给这些页面补充默认标题、图标、打开参数和层级关系。

这两者是配套关系，但不是同一件事：

- `modules` 是页面组件注册表。
- `meta` 是页面说明书。
- `meta` 不是菜单，也不是 Vue Router 路由表。

## 基础配置

Vite 项目通常这样扫描页面：

```ts
import { createTabsManager } from "@xsbcme/vue-tab-router";

const tabsManager = createTabsManager({
  views: {
    modules: import.meta.glob("@/views/**/page-index.vue", { eager: false }),
    meta: [
      {
        title: "测试工作台",
        children: [
          {
            title: "项目实践",
            viewUrl: "/src/views/practice/test-table-detail/page-index.vue",
            props: {
              _viewSingle: true,
            },
            children: [
              {
                title: "项目详情",
                viewUrl: "/src/views/practice/test-table-detail/table-detail/page-index.vue",
                props: {
                  _viewNoCache: true,
                },
              },
            ],
          },
        ],
      },
    ],
  },
});
```

`viewUrl` 要与 `modules` 的 key 保持一致。使用 `import.meta.glob("@/views/**/page-index.vue")` 时，Vite 通常会生成类似 `/src/views/user/page-index.vue` 的 key。

## 字段说明

| 字段 | 说明 |
| --- | --- |
| `id` | 可选唯一标识，主要用于没有 `viewUrl` 的分组节点。 |
| `title` | 页面默认标题。`openTab` 没有传 `_viewName` 时会使用它。 |
| `icon` | 页面默认图标。`openTab` 没有传 `_viewIcon` 时会使用它。 |
| `viewUrl` | 页面地址，对应 `modules` 的 key，也可以是 iframe/link 页面地址。 |
| `props` | 默认 `openTab` 参数。可写 `_viewSingle`、`_viewNoCache`、`_viewPinned`、业务 props 等。 |
| `meta` | 业务自定义元数据，库不会把它合并进 tab props。 |
| `children` | 子页面元数据，用于描述页面层级和面包屑。 |

## openTab 默认值

当 `openTab` 没有显式传 `_viewName` 或 `_viewIcon` 时，会从匹配到的 `views.meta` 中读取：

```ts
await tabsManager.openTab("/src/views/practice/test-table-detail/page-index.vue");
```

如果 `views.meta` 中配置了：

```ts
{
  title: "项目实践",
  icon: "IconApps",
  viewUrl: "/src/views/practice/test-table-detail/page-index.vue",
}
```

打开后的 tab 会默认显示标题“项目实践”和图标 `IconApps`。

显式传入的 `openTab` 参数优先级更高：

```ts
await tabsManager.openTab("/src/views/practice/test-table-detail/page-index.vue", {
  _viewName: "自定义标题",
});
```

此时 tab 标题会使用“自定义标题”。

## props 直接复用 openTab 参数

`props` 不需要再设计一套 `single`、`noCache`、`pinned` 映射。它直接复用 `openTab` 参数：

```ts
{
  title: "缓存测试",
  viewUrl: "/src/views/test-cache/cache-enable/page-index.vue",
  props: {
    _viewSingle: true,
    _viewNoCache: false,
    _viewPinned: true,
    source: "view-meta",
  },
}
```

其中：

- `_viewSingle`、`_viewNoCache`、`_viewPinned` 是内置 tab 行为参数。
- `source` 是业务参数，会进入 `tab.viewProps` 并传给页面组件。

## 树结构怎么理解

`children` 描述的是页面层级，不等于菜单层级。

例如“项目详情”不是菜单项，但它可以放在“项目实践”下面：

```ts
{
  title: "项目实践",
  viewUrl: "/src/views/practice/test-table-detail/page-index.vue",
  children: [
    {
      title: "项目详情",
      viewUrl: "/src/views/practice/test-table-detail/table-detail/page-index.vue",
    },
  ],
}
```

这样打开详情页时，面包屑可以显示：

```txt
项目实践 / 项目详情
```

## 非 Vite 项目

非 Vite 项目可以手写 `modules`，`meta` 的用法不变：

```ts
import UserPage from "./views/user/page-index.vue";
import UserDetailPage from "./views/user/detail/page-index.vue";

createTabsManager({
  views: {
    modules: {
      "user-page": UserPage,
      "user-detail-page": UserDetailPage,
    },
    meta: [
      {
        title: "用户管理",
        viewUrl: "user-page",
        children: [
          {
            title: "用户详情",
            viewUrl: "user-detail-page",
          },
        ],
      },
    ],
  },
});
```

后续打开时也使用同一个 key：

```ts
await tabsManager.openTab("user-detail-page");
```

## 什么时候用 meta

建议使用 `views.meta` 的场景：

- 页面标题、图标、单例、缓存策略有统一默认值。
- 详情页、编辑页等不是菜单项，但需要面包屑层级。
- 希望菜单只负责导航入口，不承担全部页面说明。
- 希望非 Vite 项目也能用同一套页面元数据。

不建议把 `views.meta` 当成完整路由系统。它不负责路径匹配、动态参数、权限路由和页面跳转守卫，这些仍然应该由业务系统或 Vue Router 处理。