# API 总览

本文以当前 `@xsbcme/vue-tab-router` 源码导出为准。

## 导出成员

```ts
// components
DynamicContainerComponent
DynamicTabsComponent
DynamicIconComponent
PreviewContainerComponent

// composables / factory
createTabsManager
useTabsManager
useTabId
defineTabOptions
defineTabEvents
onBeforeTabLeave
onBeforeTabClose

// adapters / abstract
AbstractStorageAdapter
StorageAdapter
AbstractTabsManagerPlugin
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

### `onBeforeTabLeave(guard)` / `onBeforeTabClose(guard)`

注册页面级守卫。抛错或返回 rejected Promise 会中断流程。

## 存储适配器

`AbstractStorageAdapter` 需要实现：

- `get(key, def?)`
- `set(key, value)`
- `del(key)`

内置 `StorageAdapter` 默认使用 `sessionStorage`。

## 扩展插件

继承 `AbstractTabsManagerPlugin`，并通过 `tabsManager.addPlugin(...)` 挂载。

> 参考：`onLoad` 在 `app.use(tabsManager)` 后执行，`onDestroy` 在应用卸载或插件移除时执行。