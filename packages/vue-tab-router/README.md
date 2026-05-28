# VueTabRouter

一个专注于 Vue 的多标签页路由插件，适用于后台管理系统、工作台、多文档编辑等场景。

- 支持组件页面和 iframe 页面
- 支持单页多开 / 单例复用
- 支持页面缓存控制（keep-alive）
- 支持页面级与全局守卫
- 支持父子页签事件通信
- 支持 tabs 状态持久化与插件扩展

---

## 安装

```bash
npm install @xsbcme/vue-tab-router
```

```bash
pnpm add @xsbcme/vue-tab-router
```

```bash
yarn add @xsbcme/vue-tab-router
```

---

## 版本与依赖

- Vue 3.x
- TypeScript（推荐）
- Vue 3.x

---

## 快速开始

### 1）创建 TabsManager

```ts
import { createApp } from "vue";
import App from "./App.vue";
import { createTabsManager } from "@xsbcme/vue-tab-router";

// 推荐：仅扫描页面入口组件
const modules = import.meta.glob("./views/**/page-index.vue");

const tabsManager = createTabsManager({
  modules,
  viewNameMaxLength: 20,
  onBeforeTabOpen: async (openingTab, sourceTab) => {
    console.log("open", sourceTab?.viewUrl, "=>", openingTab.viewUrl);
  },
  onBeforeTabEnter: async (toTab, fromTab) => {
    console.log("enter", fromTab?.viewUrl, "=>", toTab.viewUrl);
  },
});

createApp(App).use(tabsManager).mount("#app");
```

### 2）在布局中放置容器

```vue
<template>
  <div class="layout">
    <DynamicTabsComponent />
    <DynamicContainerComponent />
  </div>
</template>

<script setup lang="ts">
import { DynamicTabsComponent, DynamicContainerComponent } from "@xsbcme/vue-tab-router";
</script>
```

### 3）打开页面

```ts
import { useTabsManager } from "@xsbcme/vue-tab-router";

const tabsManager = useTabsManager();

// 打开组件页面
tabsManager.openTab("/views/user/page-index.vue", { userId: 1001 });
```

> 说明：`openTab` 的 `viewUrl` 必须是你在 `modules` 中注册后的组件名键。

---

## 核心概念

### TabsManager（单例）

`TabsManager` 是插件核心，负责：

- 维护 tabs 列表、当前激活 tab
- 执行打开 / 关闭 / 激活 / 刷新等行为
- 触发守卫与事件通信
- 管理持久化与插件扩展

### Tab 模型

每个 tab 都包含：

- 页面信息：`viewUrl`、`viewName`、`viewIcon`、`viewProps`
- 行为标记：`_single`、`_noCache`、`_noClose`、`_isFirst`
- 状态标记：`_isActive`、`_isRefresh`
- 链路关系：`_sourceId`（来源页签 id）

### 视图渲染

- `DynamicContainerComponent` 根据激活 tab 渲染页面
- `viewUrl` 为链接时渲染 iframe
- 否则渲染对应的 Vue 组件

---

## API（组合式函数）

## `createTabsManager(options)`

创建并初始化 tabs 管理器。

关键配置：

- `modules`: 页面模块映射（同步或异步组件）
- `storageAdapter`: 自定义存储适配器
- `source`: 异步组件 `defineAsyncComponent` 参数
- `keepAliveProps`: keep-alive 配置（如 `max`）
- `transitionProps`: 过渡动画配置
- `noActiveComponent`: 没有激活页时显示的组件
- `noExistComponent`: 页面不存在时显示的组件
- `onIframeLoad`: iframe 加载完成回调
- `onBeforeTabOpen`: 全局打开前守卫
- `onBeforeTabEnter`: 全局进入前守卫
- `onBeforeTabLeave`: 全局离开前守卫
- `onBeforeTabClose`: 全局关闭前守卫
- `viewNameMaxLength`: 标题最大展示长度（配合内置 tabs 组件）

## `useTabsManager()`

获取响应式 `TabsManager` 实例。

## `useTabId()`

在页面组件内获取当前 tabId。

## `defineTabOptions(options)`

在页面内部声明当前 tab 元信息：

- `viewName`
- `viewIcon`
- `viewSingle`
- `viewNoCache`

## `defineTabEvents(events)`

定义当前页可接收的事件，供“子页签 -> 父页签”通信使用。

## `onBeforeTabLeave(guard)`

注册页面级离开守卫。拒绝 Promise 可阻止切换。

## `onBeforeTabClose(guard)`

注册页面级关闭守卫。拒绝 Promise 可阻止关闭。

## `onBeforeTabEnter(guard)`

注册页面级进入守卫。当此 tab 被激活时触发，拒绝 Promise 可阻止激活。

---

## API（TabsManager 方法）

常用方法如下：

- `openTab(viewUrl, options)`：打开/复用页签
- `openFirstTab(viewUrl, options?, mode?)`：打开首页页签
- `changeActiveTab(tabId)`：切换激活页签
- `closeTab(tabId?, options?)`：关闭页签
- `closeTabByAll()`：全部关闭
- `closeTabsByLeft(tabId?)`：关闭左侧
- `closeTabsByRight(tabId?)`：关闭右侧
- `closeTabsByOther(tabId?)`：关闭其他
- `refreshTab(tabId?)`：刷新单个页签
- `refreshTabAll()`：刷新全部页签
- `updateTabOptions(options, tabId?)`：更新页签元信息
- `emit(eventName, data?, tabId?)`：向父页签发消息
- `clear()`：清空全部状态（页签、存储、事件）

常用只读属性：

- `tabs`: 当前所有页签
- `activeTab`: 当前激活页签
- `registerTabPaths`: 所有注册页面 key
- `activeTabParentPaths`: 当前页签可推导的父路径集合

---

## 页面打开模式

## 1）组件页面

```ts
tabsManager.openTab("/views/order/page-index.vue", {
  _viewName: "订单列表",
  _viewIcon: "icon-order",
  _viewSingle: true, // 同一路径单例
  _viewNoCache: false, // 允许缓存
  orderType: "wait-pay",
});
```

## 2）iframe 内嵌页面

当 `viewUrl` 为 `http/https`，或以 `relative:` 前缀开头时，会使用 iframe 渲染。

```ts
tabsManager.openTab("https://example.com/docs", {
  _viewName: "外部文档",
  lang: "zh-CN",
});
```

```ts
tabsManager.openTab("relative:/micro-app/index.html", {
  _viewName: "子应用",
  tenantId: "t1",
});
```

## 3）新窗口打开外链

```ts
tabsManager.openTab("https://example.com", {
  _viewOutside: true,
  _viewOutsideProps: {
    target: "_blank",
    features: "noopener,noreferrer",
  },
});
```

---

## 缓存与刷新

- 默认启用缓存（基于 keep-alive）
- `_viewNoCache: true` 可关闭单页缓存
- `refreshTab()` 强制刷新单页
- `refreshTabAll()` 强制刷新所有页签

---

## 页面通信（父子页签）

父页：

```ts
import { defineTabEvents } from "@xsbcme/vue-tab-router";

defineTabEvents({
  saved: payload => {
    console.log("子页保存完成", payload);
  },
});
```

子页：

```ts
import { useTabsManager } from "@xsbcme/vue-tab-router";

const tabsManager = useTabsManager();
tabsManager.emit("saved", { id: 1001 });
```

---

## 守卫示例

```ts
import { onBeforeTabLeave, onBeforeTabClose, onBeforeTabEnter } from "@xsbcme/vue-tab-router";

// 当前 tab 被激活前触发（从其他 tab 切换过来时）
onBeforeTabEnter(async (toTab, fromTab) => {
  console.log("enter", fromTab?.viewUrl, "=>", toTab.viewUrl);
});

// 离开当前 tab 前触发（切换到其他 tab 时）
onBeforeTabLeave(async () => {
  const ok = window.confirm("确定离开当前页面？");
  if (!ok) return false;
});

// 关闭当前 tab 前触发
onBeforeTabClose((closingTab, sourceTab) => {
  const ok = window.confirm("确定关闭当前页面？");
  if (!ok) return false;
});
```

守卫返回 `false`、抛出错误或返回 rejected Promise 都会阻止当前操作。

关闭 API 使用 options 控制强制行为：

```ts
tabsManager.closeTab(tabId, {
  ignoreNoClose: true, // 忽略 _noClose
  skipGuard: true, // 跳过关闭守卫
});

tabsManager.closeTabsByOther(tabId, {
  continueOnRejected: true, // 某个页签守卫拒绝后继续关闭后续页签
});
```

---

## 存储适配器

默认是 `sessionStorage`。你可以通过 `storageAdapter` 自定义持久化策略。

```ts
import { AbstractStorageAdapter, createTabsManager } from "@xsbcme/vue-tab-router";

class LocalStorageAdapter extends AbstractStorageAdapter {
  get<T = any>(key: string, def?: T): T {
    const raw = localStorage.getItem(key);
    if (!raw) return def as T;
    try {
      return JSON.parse(raw);
    } catch {
      return def as T;
    }
  }
  set<T = any>(key: string, val: T): this {
    localStorage.setItem(key, JSON.stringify(val));
    return this;
  }
  del(key: string): this {
    localStorage.removeItem(key);
    return this;
  }
}

const tabsManager = createTabsManager({
  modules: import.meta.glob("./views/**/page-index.vue"),
  storageAdapter: new LocalStorageAdapter(),
});
```

---

## 插件扩展

可通过 `addPlugin` 扩展 `TabsManager`：

```ts
import { AbstractTabsManagerPlugin, TabsManager } from "@xsbcme/vue-tab-router";

class LoggerPlugin extends AbstractTabsManagerPlugin {
  protected onLoad(tabsManager: TabsManager): void {
    console.log("tabs plugin loaded", tabsManager.tabs.length);
  }
  protected onDestroy(): void {
    console.log("tabs plugin destroyed");
  }
}

tabsManager.addPlugin(new LoggerPlugin());
```

---

## 内置组件

- `DynamicContainerComponent`: 主内容渲染容器
- `DynamicTabsComponent`: 标签栏组件
- `DynamicIconComponent`: 图标组件
- `PreviewContainerComponent`: 单页预览容器

---

## 注意事项

- `relative:` 为内嵌相对链接的前缀，格式为 `relative:/path/to/page.html`
- `DynamicTabsComponent` 使用组件内置样式，可通过 CSS 变量定制主题

---

## 案例项目

- Workspace: `packages/demo`

---

## License

ISC
