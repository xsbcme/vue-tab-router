# API 总览

本文以当前 `@xsbcme/vue-tab-router` 源码导出为准。

## 导出成员

```ts
// components
DynamicContainerComponent;
DynamicTabsComponent;
DynamicIconComponent;
PreviewContainerComponent;

// composables / factory
createTabsManager;
useTabsManager;
useTabId;
defineTabOptions;
defineTabEvents;
onBeforeTabLeave;
onBeforeTabClose;
onBeforeTabEnter;

// adapters / abstract
AbstractStorageAdapter;
StorageAdapter;
AbstractTabsManagerPlugin;

// theme
applyTheme;
themeToCssVariables;
defaultTheme;
lightTheme;
darkTheme;
```

## `createTabsManager(options)`

创建并初始化单例管理器。

关键配置（`ITabsManagerOptions`）：

- `modules`: 页面模块映射（同步组件或懒加载函数）
- `storageAdapter`: 自定义持久化适配器
- `source`: 透传给 `defineAsyncComponent` 的默认配置
- `transitionProps`: 页面切换过渡配置
- `keepAliveProps`: 缓存配置（如 `max`）
- `noActiveComponent`: 无激活页时渲染组件
- `noExistComponent`: 目标页面不存在时渲染组件
- `onIframeLoad`: iframe 加载完成回调
- `onBeforeTabOpen`: 全局打开前守卫
- `onBeforeTabEnter`: 全局激活前守卫
- `onBeforeTabLeave`: 全局离开前守卫
- `onBeforeTabClose`: 全局关闭前守卫
- `viewNameMaxLength`: 内置标签组件标题最大显示长度

## `useTabsManager()`

获取响应式 `tabsManager` 实例。常用属性/方法：

- `tabs`, `activeTab`, `registerTabPaths`, `activeTabParentPaths`
- `openTab`, `openFirstTab`, `changeActiveTab`
- `closeTab`, `closeTabByAll`, `closeTabsByLeft/Right/Other`
- `refreshTab`, `refreshTabAll`, `updateTabOptions`
- `emit`, `activeFirstTab`, `clear`

## `openTab(viewUrl, options?)`

重载返回：

- 组件/内联链接模式：`Promise<string>`（tabId）
- 新窗口模式（`_viewOutside: true`）：`Promise<Window>`

`IOpenTabOptions` 常用字段：

- `_viewName`: 标题
- `_viewIcon`: 图标
- `_viewSingle`: 是否单例
- `_viewNoCache`: 是否禁用缓存
- `_viewOutside`: 是否新窗口打开链接
- `_viewOutsideProps`: `window.open` 参数（`target`、`features`）

其余字段会进入 `viewProps`。

## 关闭选项

`closeTab` 与批量关闭方法支持关闭选项：

```ts
await tabsManager.closeTab(tabId, {
  ignoreNoClose: true,
  skipGuard: true,
});

await tabsManager.closeTabsByOther(tabId, {
  continueOnRejected: true,
});
```

| 字段                 | 说明                                           |
| -------------------- | ---------------------------------------------- |
| `ignoreNoClose`      | 忽略 `_noClose`，允许关闭不可关闭标签          |
| `skipGuard`          | 跳过关闭守卫与关闭回退时的切换守卫             |
| `continueOnRejected` | 批量关闭时某个标签被守卫拒绝后继续处理后续标签 |

## 页面内 API

### `useTabId()`

返回当前页面所在标签页 id（需在容器上下文内）。

### `defineTabOptions(options)`

更新当前标签页元信息：

- `viewName`
- `viewIcon`
- `viewSingle`
- `viewNoCache`

### `defineTabEvents(events)`

定义当前页可接收事件，供子页通过 `emit` 回调来源页。

### `onBeforeTabEnter(guard)` / `onBeforeTabLeave(guard)` / `onBeforeTabClose(guard)`

注册页面级守卫。返回 `false`、抛错或返回 rejected Promise 会中断流程。

## 内置组件

### `DynamicContainerComponent`

根据当前激活标签渲染 Vue 组件或 iframe，是内容区必须放置的组件。

### `DynamicTabsComponent`

内置标签栏，支持 `type`、`showIcon`、`defaultIcon`、`hideFirst`。

### `PreviewContainerComponent`

用于单页预览场景，会清空当前标签组后打开目标页。

### `DynamicIconComponent`

根据图标名查找已注册 Vue 组件，也支持直接传入 SVG 字符串、图片路径或 base64 图片。

## 存储适配器

`AbstractStorageAdapter` 需要实现：

- `get(key, def?)`
- `set(key, value)`
- `del(key)`

内置 `StorageAdapter` 默认使用 `sessionStorage`。

## 扩展插件

继承 `AbstractTabsManagerPlugin`，并通过 `tabsManager.addPlugin(...)` 挂载。

> 参考：`onLoad` 在 `app.use(tabsManager)` 后执行，`onDestroy` 在应用卸载或插件移除时执行。

## 主题 API

- `applyTheme(theme, element?)`: 将主题转换为 CSS 变量并写入元素
- `themeToCssVariables(theme)`: 返回 CSS 变量对象
- `defaultTheme` / `lightTheme` / `darkTheme`: 内置主题
