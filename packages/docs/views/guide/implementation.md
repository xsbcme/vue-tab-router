# 实现文档（基于源码）

本文档基于 `@xsbcme/vue-tab-router` 当前源码实现整理，目标是把插件的实际能力、内部机制与扩展方式讲清楚，方便你做二次开发和问题排查。

## 1. 能力总览

VueTabRouter 本质上是一个“页签状态管理器 + 动态视图容器”。

- 标签页生命周期：打开、激活、关闭、刷新、批量关闭
- 视图类型：Vue 组件视图 + iframe 视图（外链/相对链接）
- 页面缓存：基于增强版 keep-alive 控制缓存与失活恢复
- 全局守卫：`onBeforeTabOpen`、`onBeforeTabEnter`
- 页面级守卫：`onBeforeTabLeave`、`onBeforeTabClose`
- 页面通信：子页向父页 `emit`，父页通过 `defineTabEvents` 监听
- 持久化：通过 `storageAdapter` 持久化 tabs（默认 `sessionStorage`）
- 插件扩展：支持挂载 `AbstractTabsManagerPlugin` 子插件

---

## 2. 架构与模块划分

## 2.1 核心对象

- `TabsManager`：单例核心，维护 tabs 状态和所有行为方法
- `Tab`：标签页实体，包含渲染信息、行为标志位、守卫函数
- `EventManager`：单例事件中心，用于父子页签通信
- `StorageAdapter`：默认存储适配器，可替换

## 2.2 入口 API

- `createTabsManager(options)`：初始化单例并注入配置
- `useTabsManager()`：获取响应式 `TabsManager`
- `defineTabOptions()`：在页面组件内设置标签元信息
- `defineTabEvents()`：定义当前页面可接收的事件
- `onBeforeTabLeave()` / `onBeforeTabClose()`：页面级守卫注册
- `useTabId()`：获取当前页面所在 tabId

## 2.3 UI 组件

- `DynamicContainerComponent`：根据当前激活 tab 渲染组件或 iframe
- `DynamicTabsComponent`：默认标签栏 UI（基于 Arco Design Tabs）
- `PreviewContainerComponent`：单页预览容器
- `DynamicIconComponent`：图标渲染

---

## 3. 初始化与挂载流程

1. 业务侧调用 `createTabsManager(options)`，写入配置并尝试从存储恢复 tabs。
2. 业务侧 `app.use(tabsManager)`，触发 `install(app)`。
3. `install` 会改写 `app.mount`：真正挂载前执行 `registerModules()`。
4. `registerModules()` 将 `modules` 注册为全局组件：
   - 同步组件：直接注册
   - 异步组件：包装 `defineAsyncComponent`，并应用 `source` 配置
5. 插件体系执行 `loadPlugin()`，并注入 `app.config.globalProperties.$tabsManager`。

---

## 4. 标签页模型（Tab）

`Tab` 关键字段说明：

- 基础字段：`_id`、`viewUrl`、`viewName`、`viewIcon`、`viewProps`
- 状态字段：`_isActive`、`_isRefresh`、`_loading`
- 行为字段：`_single`（单例模式）、`_noCache`（禁用缓存）、`_noClose`（禁止关闭）、`_isFirst`（首页）
- 关系字段：`_sourceId`（来源/父页签 id）
- 守卫字段：`_onBeforeTabLeave`、`_onBeforeTabClose`

`_sourceId` 会在打开新 tab 时记录“来源 tab”，用于关闭回退、事件通信、链路断链修复。

---

## 5. 核心行为实现

## 5.1 打开页签 `openTab(viewUrl, options)`

### A. URL 判定

- 若 `viewUrl` 以 `realtive:` 开头或是 `http/https`，视为链接型页面
- `_viewOutside = true` 时直接 `window.open()`，不进入内部 tabs
- 否则进入内部 tab + iframe 渲染链路

### B. 组件判定

- 非 URL 时必须是已注册组件名，否则抛出“视图未注册”

### C. 复用策略

- 先按 `viewUrl + viewProps(JSON)` 查找完全匹配 tab：命中则直接激活
- 再按 `viewUrl` 查找：
  - 不存在：新增
  - 存在且 `_single !== true`：允许多开，新增
  - 存在且 `_single === true`：覆盖并刷新原 tab

### D. 生命周期与守卫触发

- 离开当前页前：执行当前 tab 的 `_onBeforeTabLeave`
- 新增前：执行全局 `onBeforeTabOpen`
- 激活前：`changeActiveTab` 内执行全局 `onBeforeTabEnter`

> 注意：组件级 `_onBeforeTabOpen` / `_onBeforeTabEnter` 相关代码在当前版本中是注释状态，未启用。

## 5.2 激活页签 `changeActiveTab(tabId)`

- 若目标已是当前激活页，直接返回
- 执行全局进入守卫 `onBeforeTabEnter`
- 遍历 tabs 设置 `_isActive`
- 写入存储

## 5.3 关闭页签 `closeTab(tabId?, force=false)`

- 非强制模式下，`_noClose` 为 `true` 时不可关闭
- 关闭前执行：
  - `_onBeforeTabLeave`
  - `_onBeforeTabClose`
- 清理此 tab 绑定的事件监听（`tabId_eventName` 前缀）
- 若关闭的是当前激活页，优先回退到其 `_sourceId` 对应页
- 删除 tab 后，修复所有指向该 tab 的 `_sourceId` 链路
- 写入存储

## 5.4 刷新能力

- `refreshTab(tabId?)`：将 tab 标记 `_isRefresh=true` 后下一个 tick 置空，触发重建
- `refreshTabAll()`：设置全局 `refreshAllTabFlag`，容器临时卸载后重渲染

## 5.5 批量关闭

- `closeTabByAll()`
- `closeTabsByLeft(tabId?)`
- `closeTabsByRight(tabId?)`
- `closeTabsByOther(tabId?)`

以上方法复用 `closeTab` 逐个处理，因此也遵守不可关闭规则和守卫规则。

## 5.6 首页能力 `openFristTab(...)`

支持三种模式：

- `clear`：先清空全部页签再打开首页
- `replace`：替换现有首页页签
- `move`：打开并移动到首位（当前实现中通过 `setFirstTab` 完成定位）

首页会被标记为 `_isFirst=true` 且 `_noClose=true`。

---

## 6. 渲染与缓存机制

`DynamicContainerComponent` 是渲染主入口：

1. 读取 `tabsManager.activeTab`
2. 若无激活页：
   - 有 `noActiveComponent` 则渲染它
   - 否则返回空
3. 若为链接页：
   - 渲染 `DynamicIframeComponent`
   - 合并 `link` 与 `linkProps` 形成最终 URL
   - iframe `load` 后触发 `onIframeLoad(e, tab)`
4. 若为组件页：
   - 从 app context 查找全局组件
   - 不存在时渲染 `noExistComponent` 或默认提示
5. 外层包裹增强 keep-alive：
   - `includeKey = tabs.filter(!tab._noCache && !tab._isRefresh).map(tab._id)`
   - `_noCache` 或 `_isRefresh` 的页面不进入缓存列表
6. 可选 `Transition` 做页面切换动画（受 `transitionProps` 控制）

---

## 7. 事件通信机制

通信模型是“子页发事件给父页”：

1. 父页中调用 `defineTabEvents({ eventName: handler })`
2. 内部注册到 `EventManager`，键格式：`{当前tabId}_{eventName}`
3. 子页调用 `tabsManager.emit(eventName, data)`
4. `emit` 会取当前 tab 的 `_sourceId`，向 `{sourceId}_{eventName}` 分发数据

这个机制天然支持“由谁打开我，我回调给谁”的页面协作模式。

---

## 8. 持久化策略

默认使用 `StorageAdapter(sessionStorage)` 存储 `tabs` 到键 `tabs`。

- 初始化：`_initOptions` 时恢复 tabs
- 运行中：打开/激活/关闭/更新等关键操作后回写
- 清理：`clear()` 时删除存储并清空事件中心

可通过自定义 `storageAdapter` 接入 `localStorage`、IndexedDB 或远端存储。

---

## 9. 插件扩展机制

`TabsManager` 继承 `Plugin`，支持：

- `addPlugin(plugin)`：添加子插件
- `getPlugin(Class)`：按类获取插件实例
- `delPlugin(Class)`：卸载插件并触发 `onDestroy`

扩展插件建议继承 `AbstractTabsManagerPlugin`，在 `onLoad(tabsManager)` 中挂接行为。

---

## 10. 默认标签栏组件能力

`DynamicTabsComponent` 提供现成的标签条交互：

- 点击标签：激活（通过 `openTab(tab.viewUrl, tab.viewProps)` 复用逻辑）
- 删除标签：关闭当前标签
- 右键菜单：
  - 刷新此页
  - 关闭左侧
  - 关闭右侧
  - 关闭其他
  - 全部关闭
  - 全部刷新
- 支持图标与标题截断显示（`viewNameMaxLength`）

---

## 11. 已知边界与注意事项

- `viewNoCahce` 字段命名沿用历史拼写（`Cahce`），使用时需保持一致。
- URL 前缀常量为 `realtive:`（历史拼写），用于标识相对链接。
- 组件级 `_onBeforeTabOpen` / `_onBeforeTabEnter` 当前未启用（源码保留注释）。
- `openFristTab` 方法名也沿用历史拼写（`Frist`）。
- `closeTabsByLeft/Right/Other` 在批量关闭后会通过 `openTab` 重新激活目标页。

---

## 12. 典型接入建议

1. 入口统一创建单例并尽早 `app.use(tabsManager)`。
2. `modules` 使用可控的 glob 规则，只暴露真正页面入口组件。
3. 页面内通过 `defineTabOptions` 动态设置标题/图标/单例/缓存策略。
4. 有“未保存数据”场景时，优先接入 `onBeforeTabLeave` 与 `onBeforeTabClose`。
5. 如需跨刷新保留页签，替换为 `localStorage` 适配器。
6. 对外链页面，区分内嵌 iframe 与 `_viewOutside` 新开窗口两种模式。

---

## 13. 最小实践示例

```ts
import { createApp } from 'vue';
import App from './App.vue';
import { createTabsManager } from '@xsbcme/vue-tab-router';

const modules = import.meta.glob('./views/**/page-index.vue');

const tabsManager = createTabsManager({
  modules,
  viewNameMaxLength: 20,
  onBeforeTabOpen: async (toTab) => {
    console.log('open =>', toTab.viewUrl);
  },
  onBeforeTabEnter: async (toTab, fromTab) => {
    console.log('enter =>', fromTab?.viewUrl, '->', toTab.viewUrl);
  }
});

createApp(App).use(tabsManager).mount('#app');
```

你可以把这篇文档视为“实现与能力的映射表”。当你要扩展功能时，建议从 `TabsManager.openTab`、`TabsManager.closeTab`、`DynamicContainerComponent` 三个位置开始追踪。
