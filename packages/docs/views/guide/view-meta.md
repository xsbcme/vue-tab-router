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

## 为什么推荐使用 import.meta.glob

`VueTabRouter` 本身并不依赖 Vite，也不要求页面必须来自 `import.meta.glob`。它真正需要的是一份页面入口注册表：`views.modules`。

在 Vite 项目中，`import.meta.glob("@/views/**/page-index.vue")` 正好可以自动生成这份注册表，所以推荐优先使用它：

- **自动发现页面入口**：构建工具按约定扫描页面文件，不需要手动维护一长串 import。
- **按需加载友好**：默认返回异步模块加载函数，天然适合后台工作台按需打开页面。
- **key 稳定可追踪**：生成的 key 来自文件路径，打开页面、菜单配置、元数据配置都可以使用同一份稳定标识。
- **避免误注册组件**：只扫描 `page-index.vue`，不会把按钮、表格、弹窗、局部业务组件都当成可打开页面。

因此，`import.meta.glob` 是 Vite 提供的工程化便利，不是插件的唯一入口。Webpack、Rspack 或其它构建方案也可以通过手写映射、代码生成、虚拟模块等方式提供等价的 `modules` 对象。

## 为什么 viewUrl 使用路径 key

`openTab(viewUrl, options)` 中的 `viewUrl` 本质上是页面入口在 `modules` 注册表里的 key。使用路径作为 key，是一种“约定优于配置”的选择。

相比给每个页面额外起一个业务 id，路径 key 有几个好处：

- **天然唯一**：文件路径在同一个注册表中天然不重复，不需要额外维护命名空间。
- **可定位源码**：看到 `/src/views/user/page-index.vue`，基本就能直接定位页面入口文件。
- **减少命名负担**：不用再为每个页面设计 `user-page`、`order-detail` 这类二次名称。
- **适合跨模块聚合**：多模块项目可以在聚合 `modules` 时重写 key，把模块名纳入页面标识，避免不同模块下同名页面冲突。

需要注意：`import.meta.glob()` 的参数必须是当前项目真实可解析的文件路径或已配置的 Vite 别名。`@moduleA/src/views/**/page-index.vue` 只有在项目里真的配置了 `@moduleA` 别名时才成立；`/src/views/**/page-index.vue` 也只是常见 Vite 项目的路径形态，具体要以你的目录结构为准。

如果是同一个项目里的多个业务模块，可以先按真实目录扫描，再把 key 统一改成带模块名前缀的业务 key。推荐在转换时去掉公共目录前缀，保留稳定、可读的页面标识：

```ts
function normalizeViewKeys(modules: Record<string, unknown>, moduleName: string, baseDir: string) {
  return Object.fromEntries(
    Object.entries(modules).map(([key, value]) => [`@${moduleName}/${key.replace(baseDir, "")}`, value])
  );
}

const salesViews = import.meta.glob("./modules/sales/views/**/page-index.vue");
const crmViews = import.meta.glob("./modules/crm/views/**/page-index.vue");

const tabsManager = createTabsManager({
  views: {
    modules: {
      ...normalizeViewKeys(salesViews, "sales", "./modules/sales/"),
      ...normalizeViewKeys(crmViews, "crm", "./modules/crm/"),
    },
  },
});
```

这样原始 key `./modules/sales/views/user/page-index.vue` 会变成 `@sales/views/user/page-index.vue`，可以直接作为 `openTab()` 的 `viewUrl`。

如果页面来自依赖包，也同样要以构建工具能解析的真实路径或别名为准。例如团队可以在 Vite 中配置包别名，再扫描并规范化 key：

```ts
// vite.config.ts
resolve: {
  alias: {
    "@sales-pages": fileURLToPath(new URL("../packages/sales/src/views", import.meta.url)),
  },
}
```

```ts
const salesPackageViews = import.meta.glob("@sales-pages/**/page-index.vue");

const modules = Object.fromEntries(
  Object.entries(salesPackageViews).map(([key, value]) => [key.replace("/packages/sales/src/", "@sales/"), value])
);
```

不同项目的别名解析结果可能不同，建议在开发阶段打印一次 `Object.keys(modules)`，再决定菜单、`views.meta` 和 `openTab()` 使用哪一套 key。只要最终传给 `views.modules` 的 key 唯一，`openTab()`、`views.meta`、菜单配置就可以使用同一套 key。

## 为什么约定 page-index.vue

`page-index.vue` 是推荐的页面入口命名约定。它的作用不是限制组件命名，而是区分“可被工作台打开的页面入口”和“页面内部使用的普通组件”。

一个典型目录可以这样组织：

```txt
src/views/order-center
├─page-index.vue        # 页面入口，会被 import.meta.glob 扫描
├─order-filter.vue      # 页面内部组件，不会被当成 tab 页面
├─order-table.vue       # 页面内部组件
└─order-detail
  ├─page-index.vue      # 详情页入口，可以独立打开为 tab
  └─detail-panel.vue    # 详情页内部组件
```

这样做的收益是：页面只有一个明确入口，内部组件仍然可以按业务语义自由命名，扫描规则也不会把所有 `.vue` 文件都注册成可打开页面。

如果团队已有其它约定，也可以改成 `@/pages/**/index.vue`、`@/views/**/route.vue` 等模式。关键不是文件名必须叫 `page-index.vue`，而是要有一个稳定、可沟通、可被扫描的页面入口约定。

## 字段说明

| 字段       | 说明                                                                                    |
| ---------- | --------------------------------------------------------------------------------------- |
| `id`       | 可选唯一标识，主要用于没有 `viewUrl` 的分组节点。                                       |
| `title`    | 页面默认标题。`openTab` 没有传 `_viewName` 时会使用它。                                 |
| `icon`     | 页面默认图标。`openTab` 没有传 `_viewIcon` 时会使用它。                                 |
| `viewUrl`  | 页面地址，对应 `modules` 的 key，也可以是 iframe/link 页面地址。                        |
| `props`    | 默认 `openTab` 参数。可写 `_viewSingle`、`_viewNoCache`、`_viewPinned`、业务 props 等。 |
| `meta`     | 业务自定义元数据，库不会把它合并进 tab props。                                          |
| `children` | 子页面元数据，用于描述页面层级和面包屑。                                                |

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
