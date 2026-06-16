# VueTabRouter

一个专注于 Vue 3 的多标签页路由插件，适用于后台管理系统、工作台、多文档编辑等场景。

- 支持组件页面和 iframe 页面
- 支持单页多开 / 单例复用
- 支持页面缓存控制（keep-alive）
- 支持页面级与全局守卫
- 支持父子页签事件通信
- 支持 tabs 状态持久化与插件扩展

---

## 文档与示例

- 文档站：https://xsbcme.github.io/vue-tab-router/doc
- 在线 Demo：https://xsbcme.github.io/vue-tab-router/demo
- 示例源码：https://gitee.com/xsbcme/vue-tab-router/tree/master/packages/demo

## 应用优势

VueTabRouter 解决的是 Vue 中后台项目里的多标签工作台问题。它不是普通 UI Tabs 组件，而是一套围绕页面生命周期设计的标签页路由管理方案，适合后台管理系统、业务工作台、多文档编辑、报表平台、iframe 集成和跨页面协作场景。

### 统一管理多类型页面

后台系统里常见的页面类型并不单一：有 Vue 组件页、iframe 报表页、外部系统链接、相对路径页面，也有需要临时预览或弹窗承载的页面。VueTabRouter 将这些页面统一到 `openTab(viewUrl, options)` 入口中，业务侧可以用同一套方式完成打开、复用、切换、刷新和关闭，减少不同页面类型带来的分支逻辑。

### 保留真实工作台状态

多标签工作台的核心价值不是“显示几个 tab”，而是让用户在多个业务上下文之间来回切换时保持现场。VueTabRouter 支持组件 keep-alive 缓存、iframe 缓存、单例复用、多开、首页、置顶、不可关闭、禁止拖拽、批量关闭和刷新等能力，适合列表、详情、审批、报表等高频切换场景。

### 降低导航状态维护成本

中后台系统常见的复杂点是菜单选中、当前 tab、面包屑、页面标题、URL 状态彼此不同步。VueTabRouter 提供页面元数据、`useTabMenu`、动态面包屑和 URL 同步能力，让菜单、标签页和页面层级可以围绕同一个 tab 状态协同工作。

### 支持业务流程控制

插件提供打开、进入、离开、关闭等全局守卫和页面级守卫。业务可以在关闭未保存表单、切换审批页面、权限校验、离开确认等场景中拦截流程，避免把这类控制逻辑散落在路由、组件和标签栏之间。

### 兼顾 iframe 与旧系统集成

很多后台系统需要嵌入 BI 报表、低代码页面、第三方平台或历史系统。VueTabRouter 对 iframe 页面提供缓存、加载回调、来源校验和 postMessage 通信能力，可以把 iframe 当作一类可管理的 tab 页面，而不是简单地塞进页面容器中。

### 扩展能力适合项目长期演进

`TabsManager` 提供插件 hooks、事件通信、存储适配器和 scoped manager。项目可以扩展埋点、权限、日志、消息通信、状态持久化，也可以为预览容器、弹窗容器创建隔离的临时标签组，避免污染主工作台。

简单来说，如果项目只是普通页面跳转，Vue Router 就够了；如果项目需要浏览器式多标签工作台，并且要处理缓存、iframe、菜单联动、守卫、通信和复杂关闭策略，VueTabRouter 可以把这些能力收敛成一套稳定的工程化方案。

---

## 与后台基础框架的关系

很多中控台基础框架已经内置多标签页能力，这类方案适合从零搭建完整后台项目，通常会一起提供布局、菜单、权限、路由、状态管理、主题、请求封装和工程规范。VueTabRouter 的定位不是替代完整后台框架，而是把多标签工作台能力从具体模板中抽离出来，作为独立插件接入已有 Vue 项目。

相比直接采用完整后台模板，VueTabRouter 更关注多标签运行时本身：页面打开与复用、组件与 iframe 缓存、关闭与切换守卫、菜单和面包屑联动、URL 状态同步、页面间通信、插件扩展和临时 scoped manager。它不强绑定具体 UI 库、菜单协议、权限模型、路由结构或工程模板，默认标签栏只是开箱即用的 UI；如果项目已有自己的设计系统，也可以直接消费 `TabsManager` 自行渲染标签栏。

因此，完整后台框架解决的是“快速生成一整套后台系统”，VueTabRouter 解决的是“为已有项目补上一套稳定的多标签工作台内核”。当团队已经有成熟技术栈、权限体系、菜单结构和 UI 规范时，独立插件比迁移到某个完整后台模板更轻量，也更容易渐进接入和长期维护。

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

如果不使用构建工具，也可以通过浏览器脚本引入。主插件的浏览器包依赖全局 `Vue`，需要先引入 Vue：

```html
<script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
<script src="https://unpkg.com/@xsbcme/vue-tab-router/dist/browser/vue-tab-router.global.js"></script>
<script>
  const { createTabsManager, DynamicTabsComponent, DynamicContainerComponent } = VueTabRouter;
</script>
```

iframe 页面只需要轻量 client 时，可以单独引入浏览器 client 包，不需要引入 Vue：

```html
<script src="https://unpkg.com/@xsbcme/vue-tab-router/dist/browser/iframe-client.global.js"></script>
<script>
  const { createIframeTabClient } = VueTabRouterIframeClient;
  const tabClient = createIframeTabClient();
</script>
```

---

## 版本与依赖

- Vue 3.x
- TypeScript（推荐）

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
  views: {
    modules,
  },
  render: {
    tabs: {
      titleMaxLength: 20,
    },
  },
  guards: {
    beforeOpen: async (openingTab, sourceTab) => {
      console.log("open", sourceTab?.viewUrl, "=>", openingTab.viewUrl);
    },
    beforeEnter: async (toTab, fromTab) => {
      console.log("enter", fromTab?.viewUrl, "=>", toTab.viewUrl);
    },
  },
});

createApp(App).use(tabsManager).mount("#app");
```

`modules` 是页面入口注册表。Vite 项目推荐使用 `import.meta.glob` 按约定扫描页面入口；`VueTabRouter` 本身不强依赖 Vite，非 Vite 项目也可以手写或生成同样结构的 `modules`。

`page-index.vue` 是推荐的页面入口约定，用来区分“可以被工作台打开的页面”和“页面内部普通组件”。这样不会把所有 `.vue` 文件都注册成 tab 页面。

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
tabsManager.openTab("/src/views/user/page-index.vue", { userId: 1001 });
```

> 说明：`openTab` 的 `viewUrl` 必须是你在 `modules` 中注册后的组件名键。

使用路径作为 `viewUrl`，是为了复用文件系统天然唯一、可定位源码的特性，减少为每个页面额外命名的负担。多模块项目可以聚合多个页面注册表，并在聚合时把模块名前缀写入 key，避免同名页面冲突。`import.meta.glob()` 的扫描路径必须是当前项目真实存在的路径或已配置的 Vite 别名，完整说明见文档站的“页面模块与元数据”。

---

## 核心概念

### TabsManager（实例）

`TabsManager` 是插件核心运行时。应用入口通常创建一个根实例，预览、弹窗显示等内部容器会创建局部实例并复用根实例的页面模块共享上下文。

弹窗显示使用局部实例承载内容，入口页会作为不可关闭首页保留。

- 维护 tabs 列表、当前激活 tab
- 执行打开 / 关闭 / 激活 / 刷新等行为
- 触发守卫与事件通信
- 管理持久化与插件扩展

### Tab 模型

每个 tab 都包含：

- 页面信息：`viewUrl`、`viewName`、`viewIcon`、`viewProps`
- 打开参数：`_viewName`、`_viewIcon`、`_viewSingle`、`_viewNoCache`、`_viewPinned`、`_viewNoDrag`
- 运行状态：`_single`、`_noCache`、`_noClose`、`_noDrag`、`_pinned`、`_isFirst`
- 状态标记：`_isActive`、`_isRefresh`
- 链路关系：`_sourceId`（来源页签 id）

内置标签栏默认启用拖拽排序，可通过 `render.tabs.draggable: false` 关闭。首页标签默认不可拖拽；置顶标签会保持在首页之后、普通标签之前，可通过 `_viewPinned` 和 `_viewNoDrag` 控制。

### 视图渲染

- `DynamicContainerComponent` 根据激活 tab 渲染页面
- `viewUrl` 为链接时渲染 iframe
- 否则渲染对应的 Vue 组件

---

## API（组合式函数）

### `createTabsManager(options)`

创建并初始化 tabs 管理器。

关键配置：

- `views.modules`: 页面模块映射（同步或异步组件）
- `views.source`: 异步组件 `defineAsyncComponent` 参数
- `storage.adapter`: 自定义存储适配器
- `plugins`: 扩展插件列表
- `render.keepAlive`: keep-alive 配置（如 `max`）
- `render.transition`: 过渡动画配置
- `render.noActiveComponent`: 没有激活页时显示的组件
- `render.noExistComponent`: 页面不存在时显示的组件
- `render.tabs.titleMaxLength`: 标题最大展示长度（配合内置 tabs 组件）
- `render.tabs.draggable`: 是否启用内置标签栏拖拽排序，默认 `true`
- `render.tabs.showIcon`: 是否在内置标签栏显示图标，默认 `true`
- `render.tabs.virtual`: 虚拟滚动配置。默认启用，但标签数量达到 `threshold: 30` 时才开始虚拟渲染
- `iframe.onLoad`: iframe 加载完成回调，可访问 iframe 元素
- `iframe.messageOrigins`: 允许接收 iframe 消息的来源，默认只允许同源
- `iframe.onMessage`: iframe 发送 `postMessage` 时触发
- `guards.beforeOpen`: 全局打开前守卫
- `guards.beforeEnter`: 全局进入前守卫
- `guards.beforeLeave`: 全局离开前守卫
- `guards.beforeClose`: 全局关闭前守卫

### `useTabsManager()`

获取响应式 `TabsManager` 实例。

### `useTabMenu(options?)`

用于把业务菜单与标签页激活状态联动起来，适合 Arco、Element Plus 等需要 `selectedKeys` / `activeKey` 的菜单组件。

```vue
<template>
  <a-menu :selected-keys="tabMenu.selectedKeys.value" auto-open-selected @menu-item-click="tabMenu.handleMenuItemClick">
    <a-menu-item v-for="menu in menus" :key="tabMenu.getMenuKey(menu)">
      {{ menu.name }}
    </a-menu-item>
  </a-menu>
</template>

<script setup lang="ts">
import { useTabMenu } from "@xsbcme/vue-tab-router";

const tabMenu = useTabMenu({
  menus: () => menus,
});
</script>
```

默认识别菜单字段：`url` / `uri` / `viewUrl`、`name` / `title`、`icon`、`props` / `viewProps`、`children`。如果业务字段不同，可以通过 `getViewUrl`、`getViewName`、`getViewIcon`、`getViewProps`、`getChildren` 自定义。

### `useTabId()`

在页面组件内获取当前 tabId。

### `defineTabOptions(options)`

在页面内部声明当前 tab 元信息：

- `viewName`
- `viewIcon`
- `viewSingle`
- `viewNoCache`
- `viewPinned`
- `viewNoDrag`

### `defineTabEvents(events)`

定义当前页可接收的事件，供“子页签 -> 父页签”通信使用。

### `onBeforeTabLeave(guard)`

注册页面级离开守卫。拒绝 Promise 可阻止切换。

### `onBeforeTabClose(guard)`

注册页面级关闭守卫。拒绝 Promise 可阻止关闭。

### `onBeforeTabEnter(guard)`

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
- `postIframeMessage(data, options?, tabId?)`：向当前激活或指定 iframe 页签发送消息
- `emit(eventName, data?, tabId?)`：向父页签发消息
- `clear()`：清空全部状态（页签、存储、事件）

常用只读属性：

- `tabs`: 当前所有页签
- `activeTab`: 当前激活页签
- `registerTabPaths`: 所有注册页面 key
- `activeTabParentPaths`: 当前页签可推导的父路径集合

---

## 页面打开模式

### 1）组件页面

```ts
tabsManager.openTab("/src/views/order/page-index.vue", {
  _viewName: "订单列表",
  _viewIcon: "icon-order",
  _viewSingle: true, // 同一路径单例
  _viewNoCache: false, // 允许缓存
  orderType: "wait-pay",
});
```

### 2）iframe 内嵌页面

当 `viewUrl` 为 `http/https`，或使用 `TabViewUrl.createRelative()` 创建相对地址时，会使用 iframe 渲染。

```ts
tabsManager.openTab("https://example.com/docs", {
  _viewName: "外部文档",
  lang: "zh-CN",
});
```

```ts
import { TabViewUrl } from "@xsbcme/vue-tab-router";

tabsManager.openTab(TabViewUrl.createRelative("/micro-app/index.html"), {
  _viewName: "子应用",
  tenantId: "t1",
});
```

iframe 加载完成后可通过 `iframe.onLoad` 操作 iframe 元素；同源 iframe 还可以访问内部文档：

```ts
createTabsManager({
  views: {
    modules,
  },
  iframe: {
    onLoad({ iframe, tab }) {
      iframe.style.backgroundColor = "#fff";

      try {
        if (tab.viewProps?.hideHeader && iframe.contentDocument) {
          const style = iframe.contentDocument.createElement("style");
          style.textContent = ".layout-header { display: none; }";
          iframe.contentDocument.head.appendChild(style);
        }
      } catch {
        // 跨域 iframe 不能访问内部 document。
      }
    },
  },
});
```

跨域 iframe 只能操作 iframe 元素本身，不能访问内部 `document`。

### iframe 通信

iframe 页面可以通过 `window.parent.postMessage` 与宿主通信，宿主可以在 `iframe.onMessage` 或插件 hook 中处理消息，并通过 `reply` 或 `postIframeMessage` 回发。

```ts
const tabsManager = createTabsManager({
  views: {
    modules,
  },
  iframe: {
    messageOrigins: ["self", "https://example.com"],
    onMessage(message) {
      if (message.data?.type === "refresh-current") {
        tabsManager.refreshTab(message.tabId);
        message.reply({ type: "refreshed" });
      }
    },
  },
  plugins: [
    ({ hooks, tabsManager }) => {
      hooks.on("iframe:message", message => {
        if (message.data?.type === "open-tab") {
          tabsManager.openTab(message.data.viewUrl, message.data.options);
        }
      });
    },
  ],
});
```

布局、工具栏等外部区域通常只需要操作当前激活 iframe：

```ts
tabsManager.postIframeMessage({ type: "set-theme", theme: "dark" });
```

需要指定 iframe tab 时，把 `tabId` 放在第三个参数：

```ts
tabsManager.postIframeMessage({ type: "set-theme", theme: "dark" }, undefined, tabId);
```

页面组件内部需要向自己所在的 iframe 页签发消息时，可以直接使用组合式函数，不需要手动传 tabId：

```ts
import { useIframeMessenger } from "@xsbcme/vue-tab-router";

const { postMessage } = useIframeMessenger();

postMessage({ type: "reload-data" });
```

iframe 页面中发送消息：

```ts
window.parent.postMessage(
  {
    type: "open-tab",
    viewUrl: "/src/views/order/page-index.vue",
    options: { _viewName: "订单" },
  },
  window.location.origin
);
```

插件宿主侧已经内置 iframe client 协议处理能力；只要 iframe 页面发出符合协议的消息，`DynamicContainerComponent` 会自动识别并按消息来源定位当前 tab。

如果 iframe 页面也由你控制，推荐在 iframe 内使用 `createIframeTabClient()`。它只是协议的 iframe 侧封装，不是宿主侧必需依赖，也不是替代宿主侧的 `iframe.onMessage`。它让 iframe 页面自己持有业务逻辑：读取当前 tab、更新标题、打开子标签、刷新/关闭当前标签、向来源页签发事件。

这意味着你可以把逻辑写回 iframe 页面内部，而不是继续在全局 `iframe.onMessage` 里靠 `tabId` 分支判断“这是哪个页面”。

iframe 子项目只需要轻量 client 能力，必须从子入口导入，避免引入宿主侧组件、TabsManager 和存储等完整插件能力：

```ts
import { createIframeTabClient } from "@xsbcme/vue-tab-router/iframe-client";

const tabClient = createIframeTabClient();

const tab = await tabClient.getTab();
await tabClient.updateTabOptions({ _viewName: `报表 ${tab.viewProps?.reportId}` });

document.querySelector("#refresh")?.addEventListener("click", () => {
  tabClient.refreshTab();
});

document.querySelector("#open-detail")?.addEventListener("click", () => {
  tabClient.openTab("/src/views/order/detail/page-index.vue", {
    _viewName: "订单详情",
    orderId: 1001,
  });
});
```

如果 iframe 页面没有构建工具，也可以直接使用浏览器 client 包：

```html
<script src="https://unpkg.com/@xsbcme/vue-tab-router/dist/browser/iframe-client.global.js"></script>
<script>
  const tabClient = VueTabRouterIframeClient.createIframeTabClient();
  tabClient.updateTabOptions({ _viewName: "Iframe 已就绪" });
</script>
```

如果你只是想在宿主统一监听 iframe 的消息，继续使用 `iframe.onMessage` + `postMessage` 即可。`iframe client` 只解决“iframe 页面自己管理当前标签”的场景，两者可以同时存在。

宿主仍然可以向某个 iframe 页签发送业务消息，iframe 内部按消息类型局部监听即可：

```ts
const stopTheme = tabClient.on<{ type: "set-theme"; theme: string }>("set-theme", message => {
  document.documentElement.dataset.theme = message.theme;
});

// 页面卸载时可主动清理。
stopTheme();
tabClient.dispose();
```

默认只接收同源消息。跨域 iframe 需要显式配置 `iframe.messageOrigins`，不建议在生产环境使用 `"*"`。

### 3）新窗口打开外链

```ts
tabsManager.openTab("https://example.com", {
  _viewOutside: {
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

默认在浏览器中使用 `sessionStorage`。在 SSR 或 Node 环境中创建 `TabsManager` 时，内置适配器会退化为进程内内存存储；如果服务端不需要恢复标签状态，建议显式设置 `storage.enabled: false`，或通过 `storage.adapter` 提供自己的持久化策略。

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
  views: {
    modules: import.meta.glob("./views/**/page-index.vue"),
  },
  storage: {
    adapter: new LocalStorageAdapter(),
  },
});
```

服务端创建实例时可关闭持久化：

```ts
const tabsManager = createTabsManager({
  views: {
    modules: {},
  },
  storage: {
    enabled: false,
  },
});
```

---

## 插件扩展

可通过 `plugins` 扩展 `TabsManager`，插件会在 `app.use(tabsManager)` 时安装：

```ts
import { createTabsManager } from "@xsbcme/vue-tab-router";

const tabsManager = createTabsManager({
  views: {
    modules: import.meta.glob("./views/**/page-index.vue"),
  },
  plugins: [
    ({ hooks, tabsManager }) => {
      console.log("tabs plugin loaded", tabsManager.tabs.length);

      hooks.on("tab:opened", tab => {
        console.log("tab opened", tab.viewUrl);
      });

      return () => {
        console.log("tabs plugin destroyed");
      };
    },
  ],
});
```

---

## 内置组件

- `DynamicContainerComponent`: 主内容渲染容器
- `DynamicTabsComponent`: 标签栏组件
- `DynamicIconComponent`: 图标组件
- `PreviewContainerComponent`: 单页预览容器

---

## 注意事项

- 相对 iframe 地址建议使用 `TabViewUrl.createRelative("/path/to/page.html")` 创建
- `DynamicTabsComponent` 使用组件内置样式，可通过 CSS 变量定制主题

---
