# 菜单联动

`useTabMenu` 用于把业务菜单和当前激活标签页关联起来。它会统一生成菜单 key、维护 `selectedKeys`，并提供菜单点击后打开 tab 的方法。

## 基础接入

```vue
<template>
  <MenuComponent
    :menus="menus"
    :selected-keys="tabMenu.selectedKeys.value"
    :get-menu-key="tabMenu.getMenuKey"
    @select-menu="tabMenu.handleMenuItemClick"
  />
</template>

<script setup lang="ts">
import { useTabMenu } from "@xsbcme/vue-tab-router";

const tabMenu = useTabMenu({
  menus: () => menus,
});
</script>
```

默认识别字段：

| 字段                      | 说明     |
| ------------------------- | -------- |
| `url` / `uri` / `viewUrl` | 页面地址 |
| `name` / `title`          | 标签标题 |
| `icon`                    | 标签图标 |
| `props` / `viewProps`     | 打开参数 |
| `children`                | 子菜单   |

## key 规则

默认 key 由 `viewUrl + viewProps` 生成。为了避免标题、图标等展示参数导致菜单无法选中，默认会忽略：

- `_viewName`
- `_viewIcon`
- `_viewNoCache`
- `_viewSingle`

会影响打开行为或菜单身份的字段会保留，例如：

- `_viewOutside`
- `_viewOutsideProps`
- 业务字段，如 `a`、`id`、`menuKey`

因此内部链接和新窗口外部链接不会串选：

```ts
createTabMenuKey("http://www.baidu.com/");
// http://www.baidu.com/

createTabMenuKey("http://www.baidu.com/", { _viewOutside: true });
// http://www.baidu.com/?_viewOutside=true
```

相同地址但不同业务菜单时，建议传稳定业务字段：

```ts
import { TabViewUrl } from "@xsbcme/vue-tab-router";

{
  name: "内部相对链接",
  url: TabViewUrl.createRelative("./"),
  props: {
    _viewName: "内部相对链接",
    menuKey: "relative-inline",
  },
}
```

## 自定义字段

业务菜单字段不一致时，可以自定义读取函数：

```ts
const tabMenu = useTabMenu({
  menus: () => menus,
  getViewUrl: menu => menu.path,
  getViewName: menu => menu.label,
  getViewIcon: menu => menu.meta?.icon,
  getViewProps: menu => menu.params,
  getChildren: menu => menu.routes,
});
```

如果系统已经有唯一菜单 id，也可以自定义 key：

```ts
const tabMenu = useTabMenu({
  menus: () => menus,
  getMenuKey: menu => String(menu.id),
  getTabKey: tab => String(tab.viewProps?.menuId ?? ""),
});
```

此时打开菜单时需要把对应 `menuId` 写入 `viewProps`，确保 tab 能反查菜单。

## 面包屑导航

面包屑优先使用 `views.meta`。它不是菜单，也不是路由，而是对 `views.modules` 中 `viewUrl` 的元数据补充：

```ts
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
              },
            ],
          },
        ],
      },
    ],
  },
});
```

Vite 项目通常用 `import.meta.glob` 扫描 `modules`，再用 `meta` 补充标题、图标、默认打开参数和层级。非 Vite 项目也可以手写 `modules`，`meta` 不依赖 Vite，只要 `viewUrl` 能对应到已注册页面即可。

`meta.props` 直接复用 `openTab` 参数，因此 `_viewSingle`、`_viewNoCache`、`_viewPinned`、`_viewNoDrag` 等仍然按原有规则书写，不需要额外映射。

当 `openTab` 没有显式传 `_viewName` 或 `_viewIcon` 时，会自动从匹配到的 `views.meta` 中读取 `title` 和 `icon`：

```ts
tabsManager.openTab("/src/views/practice/test-table-detail/page-index.vue");
```

如果 `views.meta` 配置了 `title: "项目实践"`，则 tab 标题会默认显示为“项目实践”。显式传入的 `openTab` 参数优先级更高。

`DynamicBreadcrumbComponent` 可以基于 `useTabMenu` 的菜单解析结果生成轻量面包屑：

```vue
<template>
  <DynamicBreadcrumbComponent :menus="menus" :get-menu-key="tabMenu.getMenuKey" />
</template>

<script setup lang="ts">
import { DynamicBreadcrumbComponent, useTabMenu } from "@xsbcme/vue-tab-router";

const tabMenu = useTabMenu({
  menus: () => menus,
});
</script>
```

非末级面包屑会支持返回上级：如果该项来自菜单，则按菜单配置打开；如果该项来自 `views.meta`，则按它的 `viewUrl` 调用 `openTab`。

生成规则：

1. 当前 tab 能匹配 `views.meta` 时，使用 `views.meta` 层级路径。
2. 当前 tab 能匹配菜单树时，使用菜单树路径。
3. 当前 tab 不在 `views.meta` 和菜单树中时，尝试通过已注册组件路径推断父级页面。
4. 推断出的父级页面如果能匹配菜单树，使用菜单标题和层级。
5. 如果父级页面已经打开过，使用父级 tab 的标题。
6. 仍然无法推断时，回退显示当前 tab 标题。

例如注册了：

```ts
import.meta.glob("@/views/**/page-index.vue");
```

并且菜单中存在：

```ts
{
  name: "项目实践",
  url: "/src/views/practice/test-table-detail/page-index.vue",
}
```

当打开的详情页为：

```ts
tabsManager.openTab("/src/views/practice/test-table-detail/table-detail/page-index.vue", {
  _viewName: "项目详情",
});
```

如果没有配置 `views.meta`，即使详情页不在菜单中，也可以通过目录结构推断出：

```text
项目实践 / 项目详情
```

如果菜单项本身还有父级，例如 `测试工作台 -> 项目实践`，则会显示完整菜单路径：

```text
测试工作台 / 项目实践 / 项目详情
```

### 为什么不是完整路由式面包屑

更完整的方案是像 Vue Router 一样维护一份所有页面的路由记录，再由路由记录生成菜单和面包屑。这种方式最准确，但也意味着需要额外维护页面路由表、路径匹配、动态参数、隐藏路由、标题 meta 等能力。

`vue-tab-router` 当前定位是标签页管理器，不是完整路由系统。为了一个面包屑引入完整页面路由表，会让配置和心智负担明显变重，也会和现有基于 `viewUrl` 的动态组件模型产生重复。

因此内置面包屑采用更轻的策略：

- `views.meta` 负责给 `modules` 补充标题、图标、默认打开参数和页面层级。
- 菜单树可以继续作为导航入口来源。
- 文件目录结构负责非菜单详情页的父级推断。
- 无法推断时回退当前 tab 标题。

这种方案不是“完美面包屑路由”，但足够覆盖常见的菜单页和目录型详情页，同时不会把库推成半个路由系统。
