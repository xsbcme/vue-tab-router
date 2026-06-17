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
- 未注册页面会渲染 `render.noExistComponent`，默认使用 `DefaultNotFoundComponent`。
- 没有激活 tab 时会渲染 `render.noActiveComponent`，默认使用 `DefaultEmptyComponent`。
- 异步组件加载中默认使用 `DefaultLoadingComponent`，加载失败默认使用 `DefaultErrorComponent`。
- iframe 初次加载会显示加载组件；同文档 hash/history 导航会归一化触发 `iframe:load`，不会让加载状态悬挂。

## 默认状态组件

内置状态组件可直接导入，也可作为自定义组件的基础样式参考：

```ts
import {
  DefaultEmptyComponent,
  DefaultErrorComponent,
  DefaultLoadingComponent,
  DefaultNotFoundComponent,
} from "@xsbcme/vue-tab-router";
```

| 组件                       | 默认使用场景                  | 覆盖配置                                                                              |
| -------------------------- | ----------------------------- | ------------------------------------------------------------------------------------- |
| `DefaultLoadingComponent`  | 异步组件加载、iframe 加载     | `render.loadingComponent`、`iframe.loadingComponent`、`views.source.loadingComponent` |
| `DefaultErrorComponent`    | 异步组件加载失败              | `render.errorComponent`、`views.source.errorComponent`                                |
| `DefaultEmptyComponent`    | 没有激活 tab                  | `render.noActiveComponent`                                                            |
| `DefaultNotFoundComponent` | 已恢复 tab 但目标组件无法解析 | `render.noExistComponent`                                                             |

```ts
const tabsManager = createTabsManager({
  views: { modules },
  render: {
    loadingComponent: AppLoading,
    errorComponent: AppError,
    noActiveComponent: AppEmpty,
    noExistComponent: AppNotFound,
  },
  iframe: {
    loadingComponent: IframeLoading,
  },
});
```

## DynamicTabsComponent

内置标签栏。

```vue
<DynamicTabsComponent />
```

常用 props：

| 字段             | 说明                                                                                                    |
| ---------------- | ------------------------------------------------------------------------------------------------------- |
| `type`           | 标签栏样式类型。                                                                                        |
| `showIcon`       | 是否显示图标；未传时使用 `render.tabs.showIcon`，默认 `true`。                                          |
| `defaultIcon`    | 没有图标时的默认图标。                                                                                  |
| `titleMaxLength` | 标签标题最大显示长度；未传时使用 `render.tabs.titleMaxLength`。                                         |
| `draggable`      | 是否启用拖拽排序；未传时使用 `render.tabs.draggable`，默认 `true`。                                     |
| `virtual`        | 虚拟滚动配置；未传时使用 `render.tabs.virtual`，默认启用，标签数量达到 `threshold: 30` 时开始虚拟渲染。 |
| `hideFirst`      | 是否隐藏首页标签。                                                                                      |

内置标签栏支持激活、关闭、右键菜单、刷新、弹窗显示、置顶和拖拽排序。图标显示可通过 `render.tabs.showIcon` 全局控制，也可通过组件 `showIcon` prop 局部覆盖；拖拽能力可通过 `render.tabs.draggable` 全局控制，也可通过 `_viewNoDrag` 控制单个 tab。

虚拟滚动默认参数为 `{ enabled: true, threshold: 30, overscan: 6, estimatedWidth: 148, minWidth: 72, maxWidth: 260 }`。如果希望 20 个标签页也启用虚拟渲染，可设置 `virtual: { threshold: 20 }`。

拖拽排序规则：首页标签不可拖动，`_viewNoDrag` 标签不可拖动，置顶标签只能在置顶组内排序，普通标签只能在普通组内排序；激活状态不限制排序，移动后激活状态会跟随原 tab 保留。

## DynamicBreadcrumbComponent

内置面包屑。

```vue
<DynamicBreadcrumbComponent :menus="menus" :get-menu-key="tabMenu.getMenuKey" :show-icon="false" />
```

常用 props：

| 字段           | 说明                        |
| -------------- | --------------------------- |
| `menus`        | 菜单树。                    |
| `getChildren`  | 自定义读取子菜单。          |
| `getViewUrl`   | 自定义读取页面地址。        |
| `getViewName`  | 自定义读取页面标题。        |
| `getViewIcon`  | 自定义读取页面图标。        |
| `getViewProps` | 自定义读取打开参数。        |
| `getMenuKey`   | 自定义菜单 key。            |
| `getTabKey`    | 自定义 tab key。            |
| `separator`    | 分隔符，默认 `/`。          |
| `showIcon`     | 是否显示图标，默认 `true`。 |

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
    loadingComponent: IframeLoading,
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

`iframe.loadingComponent` 只负责加载中视觉。iframe 原生 `error` 事件无法可靠表达页面失败，跨域页面、服务端错误页和 SPA fallback 都可能误判；如果需要 iframe 失败态，建议通过超时策略或 iframe 内部 `postMessage` 上报业务失败。

iframe 页面发送消息：

```ts
window.parent.postMessage({ type: "refresh-current" }, window.location.origin);
```

iframe 内部的普通超链接属于 iframe 页面自身行为。若链接带有 `target="_blank"` 或页面调用 `window.open`，浏览器会按原生规则打开新标签页；跨域 iframe 也无法由宿主直接拦截内部点击。需要在宿主标签页系统中打开链接时，推荐由可控 iframe 页面拦截点击并发送消息给宿主，再由宿主调用 `tabsManager.openTab()`。

```ts
document.addEventListener("click", event => {
  const link = event.target.closest("a[data-open-tab]");
  if (!link) return;

  event.preventDefault();
  window.parent.postMessage(
    {
      type: "open-tab",
      viewUrl: link.getAttribute("href"),
      options: { _viewName: link.textContent?.trim() },
    },
    window.location.origin
  );
});
```

宿主发送消息：

```ts
tabsManager.postIframeMessage({ type: "set-theme", theme: "dark" });
tabsManager.postIframeMessage({ type: "reload" }, undefined, tabId);
```

默认只接收同源消息。跨域 iframe 需要显式配置 `messageOrigins`，生产环境不建议使用 `"*"`。
