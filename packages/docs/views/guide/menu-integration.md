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

`DynamicBreadcrumbComponent` 可以复用 `useTabMenu` 的菜单解析规则，让菜单选中和面包屑点击使用同一套 key：

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

如果需要给非菜单详情页配置层级、默认标题或点击返回上级，请阅读：

- [页面模块与元数据](/views/guide/view-meta)
- [面包屑导航](/views/guide/breadcrumb)
