# 面包屑导航

这一页接在 [菜单联动](/views/guide/menu-integration) 之后阅读最自然。菜单通常提供一级入口，`views.meta` 负责补充详情页、编辑页这类非菜单页面的层级。

`DynamicBreadcrumbComponent` 是内置的轻量面包屑组件，适合放在工作台头部或标签栏下方。它会根据当前激活 tab 自动生成层级，并支持点击非末级节点返回上级页面。

## 基础接入

```vue
<template>
  <DynamicBreadcrumbComponent :menus="menuStore.getMenus" :get-menu-key="tabMenu.getMenuKey" :show-icon="false" />
</template>

<script setup lang="ts">
import { DynamicBreadcrumbComponent, useTabMenu } from "@xsbcme/vue-tab-router";

const tabMenu = useTabMenu({
  menus: () => menuStore.getMenus,
});
</script>
```

如果不传 `menus`，组件仍然可以使用 `views.meta` 和目录结构推断生成面包屑。

## 推荐：用 views.meta 描述页面层级

最稳定的方式是在 `createTabsManager` 中配置 `views.meta`：

```ts
createTabsManager({
  views: {
    modules: import.meta.glob("@/views/**/page-index.vue", { eager: false }),
    meta: [
      {
        title: "测试工作台",
        children: [
          {
            title: "项目实践",
            viewUrl: "/src/views/practice/test-table-detail/page-index.vue",
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

打开详情页时：

```ts
await tabsManager.openTab("/src/views/practice/test-table-detail/table-detail/page-index.vue");
```

面包屑会显示：

```txt
测试工作台 / 项目实践 / 项目详情
```

如果点击“项目实践”，组件会按该项的 `viewUrl` 调用 `openTab` 返回上级页面。

## 生成优先级

面包屑按下面的顺序生成：

1. 当前 tab 能匹配 `views.meta` 时，使用 `views.meta` 层级路径。
2. 当前 tab 能匹配菜单树时，使用菜单树路径。
3. 当前 tab 不在 `views.meta` 和菜单树中时，尝试通过已注册组件路径推断父级页面。
4. 推断出的父级页面如果能匹配菜单树，使用菜单标题和层级。
5. 如果父级页面已经打开过，使用父级 tab 的标题。
6. 仍然无法推断时，回退显示当前 tab 标题。

这个顺序的含义是：明确配置优先，推断兜底。

## 点击返回上级

非末级面包屑项会渲染成按钮，并支持两种返回方式：

- 来自菜单的项：调用 `useTabMenu().openMenu(menu)`，会携带菜单配置里的标题、图标和 props。
- 来自 `views.meta` 的项：调用 `tabsManager.openTab(item.viewUrl)`，并自动使用该 viewUrl 对应的 meta 默认值。

如果某个分组节点只有 `title`、没有 `viewUrl`，它只会作为层级展示，不可点击。

## 目录结构推断

即使没有配置 `views.meta`，也可以通过页面文件路径推断父级。

例如注册了：

```ts
import.meta.glob("@/views/**/page-index.vue");
```

并且存在两个页面：

```txt
/src/views/practice/test-table-detail/page-index.vue
/src/views/practice/test-table-detail/table-detail/page-index.vue
```

当打开详情页时：

```ts
await tabsManager.openTab("/src/views/practice/test-table-detail/table-detail/page-index.vue", {
  _viewName: "项目详情",
});
```

组件会尝试找到父级页面 `/src/views/practice/test-table-detail/page-index.vue`。如果这个父级页面能匹配菜单，就显示菜单层级；如果父级 tab 已打开，就显示父级 tab 标题；否则回退显示路径。

目录推断适合作为兜底，不建议把它当作长期唯一方案。复杂项目更建议配置 `views.meta`。

## 常见配置

隐藏图标：

```vue
<DynamicBreadcrumbComponent :show-icon="false" />
```

自定义分隔符：

```vue
<DynamicBreadcrumbComponent separator=">" />
```

配合自定义菜单字段：

```vue
<DynamicBreadcrumbComponent
  :menus="menus"
  :get-children="menu => menu.routes"
  :get-view-url="menu => menu.path"
  :get-view-name="menu => menu.label"
  :get-view-icon="menu => menu.meta?.icon"
/>
```

## 与菜单的关系

菜单负责“用户从哪里进入页面”，面包屑负责“当前页面处在哪个层级”。两者经常相同，但不应该强绑定。

例如详情页通常不是菜单项，但它仍然应该能显示在“项目实践”下面。这个层级更适合放在 `views.meta`，而不是把所有详情页都塞进菜单树。

## 为什么不是完整路由式面包屑

像 Vue Router 一样维护完整路由记录当然更精确，但也会引入路径匹配、动态参数、隐藏路由、权限路由、标题 meta 等一整套路由能力。

`VueTabRouter` 的定位是标签页管理器，不是完整路由系统。因此内置面包屑采用轻量策略：

- `views.meta` 描述明确页面层级。
- 菜单树提供导航入口层级。
- 文件目录结构作为非菜单页面的兜底推断。

这样能覆盖后台工作台里最常见的菜单页、详情页、编辑页，同时不会强迫项目维护第二套路由表。
