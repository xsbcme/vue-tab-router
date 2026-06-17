# API 总览

本文按使用场景整理 `@xsbcme/vue-tab-router` 的公开 API。建议先阅读指南，再回到这里查具体参数和返回值。

## 导入入口

```ts
import {
  createTabsManager,
  useTabsManager,
  useTabMenu,
  DynamicTabsComponent,
  DynamicContainerComponent,
} from "@xsbcme/vue-tab-router";
import { createTabUrlSyncPlugin } from "@xsbcme/vue-tab-router/plugins/tab-url-sync";
```

完整导出来自包入口：

```ts
export * from "./components";
export * from "./use-tabs-manager";
export * from "./use-tab-menu";
export * from "./iframe-message";
export * from "./abstract-storage-adapter";
export * from "./storage-adapter";
export * from "./tabs-manager-plugin";
export * from "./types";
export { TabViewUrl, type TabViewUrlRelative } from "./utils";
```

内置插件使用插件域独立入口，未导入时不会进入主入口依赖图。当前内置插件包括 URL 同步插件：

```ts
import { createTabUrlSyncPlugin } from "@xsbcme/vue-tab-router/plugins/tab-url-sync";
```

## 分类索引

| 分类                                     | 适合查什么                                                                         |
| ---------------------------------------- | ---------------------------------------------------------------------------------- |
| [TabsManager](/views/api/tabs-manager)   | 创建实例、打开/关闭/刷新/更新标签、弹窗显示、scoped manager。                      |
| [组合式 API](/views/api/composables)     | `useTabsManager`、`useTabMenu`、页面内声明标题和守卫。                             |
| [内置组件](/views/api/components)        | `DynamicContainerComponent`、`DynamicTabsComponent`、面包屑、预览容器等。          |
| [插件与 hooks](/views/api/plugins)       | 自定义插件、生命周期 hooks、URL 同步插件。                                         |
| [类型与工具](/views/api/types-and-utils) | `TabsManagerOptions`、`IOpenTabOptions`、`TabViewMeta`、`TabViewUrl`、存储适配器。 |

## 常用组合

创建工作台：

```ts
const tabsManager = createTabsManager({
  views: {
    modules: import.meta.glob("@/views/**/page-index.vue", { eager: false }),
  },
});
```

布局渲染：

```vue
<template>
  <DynamicTabsComponent />
  <DynamicContainerComponent />
</template>
```

菜单联动：

```ts
const tabMenu = useTabMenu({
  menus: () => menus,
});
```

地址栏同步：

```ts
createTabUrlSyncPlugin(router, {
  routePath: "/dashboard",
  queryKey: "activeTab",
});
```

## 命名规则

- `_view*` 字段是内置 tab 行为或展示参数。
- 非 `_view*` 字段会进入 `tab.viewProps`，并作为页面组件 props。
- `viewUrl` 是打开页面的唯一入口，可以是组件 key、http/https 链接，也可以是 `TabViewUrl.createRelative()` 生成的相对 iframe 地址。
- 当 `viewUrl` 指向组件页面时，它必须匹配 `views.modules` 中的 key；该 key 可以来自 `import.meta.glob()`，也可以来自手写注册表或代码生成。
- `import.meta.glob()` 的扫描路径必须是当前项目真实路径或已配置别名；多模块页面应在聚合 `modules` 时规范化 key，避免同名页面冲突。

## 下一步

- 想查 `openTab` 参数：看 [TabsManager](/views/api/tabs-manager)。
- 想查菜单和面包屑返回值：看 [组合式 API](/views/api/composables)。
- 想了解内置插件：看 [内置插件](/views/guide/built-in-plugins)。
- 想查 URL 同步完整 API：看 [插件与 hooks](/views/api/plugins)。
- 想查配置类型：看 [类型与工具](/views/api/types-and-utils)。
