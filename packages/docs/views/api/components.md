# 内置组件 API

内置组件负责渲染标签栏、内容容器、面包屑、预览容器和弹窗容器。组件都可以直接从包入口导入。

## DynamicContainerComponent

内容容器。它根据当前激活 tab 渲染 Vue 组件或 iframe，是工作台内容区必须放置的组件。

```vue
<template>
  <DynamicContainerComponent />
</template>
```

说明：

- 组件页面来自 `views.modules`。
- iframe 页面来自 http/https 或 `TabViewUrl.createRelative()`。
- `_viewNoCache: true` 会让页面切换后重新创建。
- 未注册页面会渲染 `render.noExistComponent`。
- 没有激活 tab 时会渲染 `render.noActiveComponent`。

## DynamicTabsComponent

内置标签栏。

```vue
<DynamicTabsComponent />
```

常用 props：

| 字段 | 说明 |
| --- | --- |
| `type` | 标签栏样式类型。 |
| `showIcon` | 是否显示图标。 |
| `defaultIcon` | 没有图标时的默认图标。 |
| `hideFirst` | 是否隐藏首页标签。 |

内置标签栏支持激活、关闭、右键菜单、刷新、弹窗显示、置顶和拖拽排序。拖拽能力可通过 `render.draggable` 全局控制，也可通过 `_viewNoDrag` 控制单个 tab。

## DynamicBreadcrumbComponent

内置面包屑。

```vue
<DynamicBreadcrumbComponent
  :menus="menus"
  :get-menu-key="tabMenu.getMenuKey"
  :show-icon="false"
/>
```

常用 props：

| 字段 | 说明 |
| --- | --- |
| `menus` | 菜单树。 |
| `getChildren` | 自定义读取子菜单。 |
| `getViewUrl` | 自定义读取页面地址。 |
| `getViewName` | 自定义读取页面标题。 |
| `getViewIcon` | 自定义读取页面图标。 |
| `getViewProps` | 自定义读取打开参数。 |
| `getMenuKey` | 自定义菜单 key。 |
| `getTabKey` | 自定义 tab key。 |
| `separator` | 分隔符，默认 `/`。 |
| `showIcon` | 是否显示图标，默认 `true`。 |

生成规则详见 [面包屑导航](/views/guide/breadcrumb)。

## PreviewContainerComponent

预览容器，用于临时嵌入一个页面，同时保持与主工作台隔离。

```vue
<PreviewContainerComponent
  view-url="/src/views/order/detail/page-index.vue"
  :view-props="{ id: 1001 }"
  view-name="订单详情"
/>
```

行为：

- 使用 scoped manager，默认不污染主实例 tab 状态。
- 目标页作为首页标签打开。
- `viewUrl`、`viewProps` 或 `viewName` 变化时会重建预览页。
- 目标页继续打开其它页面后才显示标签栏。
- 打开失败时触发 `error` 事件。

## DetachedContainerComponent

弹窗显示容器。一般放在应用根布局中。

```vue
<DetachedContainerComponent />
```

当调用 `tabsManager.openDetachedTab(tabId)` 后，它会渲染弹窗内容。弹窗默认层级和全屏策略由 `detached.zIndex`、`detached.fullscreen` 控制。

## DynamicIconComponent

动态图标组件。

```vue
<DynamicIconComponent icon="IconApps" />
```

支持已注册 Vue 图标组件名、SVG 字符串、图片 URL 和 base64 图片。

## iframe 通信

iframe 由 `DynamicContainerComponent` 内部渲染。相关配置在 `createTabsManager({ iframe })` 中声明：

```ts
const tabsManager = createTabsManager({
  views: { modules },
  iframe: {
    messageOrigins: ["self", "https://example.com"],
    onLoad({ iframe, tab }) {
      iframe.style.backgroundColor = "#fff";
    },
    onMessage(message) {
      if (message.data?.type === "refresh-current") {
        tabsManager.refreshTab(message.tabId);
        message.reply({ type: "refreshed" });
      }
    },
  },
});
```

iframe 页面发送消息：

```ts
window.parent.postMessage({ type: "refresh-current" }, window.location.origin);
```

宿主发送消息：

```ts
tabsManager.postActiveIframeMessage({ type: "set-theme", theme: "dark" });
tabsManager.postIframeMessage(tabId, { type: "reload" });
```

默认只接收同源消息。跨域 iframe 需要显式配置 `messageOrigins`，生产环境不建议使用 `"*"`。
