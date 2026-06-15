# Iframe 通信与缓存

这一页是 iframe 进阶内容。先确认你已经了解 [内联页面导航](/views/guide/inline-navigation)，再处理缓存、宿主通信和跨域来源校验。

链接型页面支持两种打开方式：

- 内部打开：作为 iframe 标签页渲染
- 外部打开：传 `_viewOutside: true` 或 `_viewOutside: { target, features }` 后使用 `window.open`

## 打开 iframe 标签

```ts
import { TabViewUrl } from "@xsbcme/vue-tab-router";

const tabsManager = useTabsManager();

tabsManager.openTab(TabViewUrl.createRelative("/iframe-tests/message.html"), {
  _viewName: "同源 Iframe",
  iframeDemo: true,
});
```

`TabViewUrl.createRelative()` 会创建当前系统内的相对 iframe 地址。`http` / `https` 地址也会作为链接型页面处理。

## 缓存与不缓存

iframe 缓存不是 Vue `KeepAlive`，而是由容器维护一个持久 iframe DOM 层。默认会缓存 iframe：切换到其他标签再回来时，iframe 内部状态会保留。

```ts
tabsManager.openTab(TabViewUrl.createRelative("/iframe-tests/cache.html"), {
  _viewName: "缓存 Iframe",
});
```

禁用缓存时，切换离开后会销毁 iframe，回来时重新加载：

```ts
tabsManager.openTab(TabViewUrl.createRelative("/iframe-tests/cache.html"), {
  _viewName: "不缓存 Iframe",
  _viewNoCache: true,
});
```

Demo 的 `Iframe 通信与样式` 页面提供了“缓存 iframe / 不缓存 iframe / 打开组件页用于切换”三步对照。缓存 iframe 的加载标识和页面内计数应保留；不缓存 iframe 切回来会变成新的加载标识。

## 接收 iframe 消息

初始化时配置允许来源和消息回调：

```ts
const tabsManager = createTabsManager({
  views: {
    modules,
  },
  iframe: {
    messageOrigins: ["self"],
    onMessage(message) {
      if (message.data?.type === "iframe:refresh-current") {
        tabsManager.refreshTab(message.tabId);
        message.reply({ type: "host:refreshed" });
      }
    },
  },
});
```

默认只允许同源消息。跨域 iframe 需要显式配置来源，不建议生产环境使用 `"*"`。

## 宿主向 iframe 发送消息

向当前激活 iframe 发送：

```ts
tabsManager.postActiveIframeMessage({ type: "host:active-message" });
```

向指定 iframe tab 发送：

```ts
tabsManager.postIframeMessage(tabId, { type: "host:tab-id-message" });
```

在当前页面组件内部免 tabId 发送：

```ts
import { postCurrentIframeMessage } from "@xsbcme/vue-tab-router";

postCurrentIframeMessage({ type: "page:message" });
```

## iframe 页面发送消息

```ts
window.parent.postMessage({ type: "iframe:ping" }, window.location.origin);
```

这种方式适合宿主统一处理协议，例如所有 iframe 都把 `{ type, payload }` 发给 `iframe.onMessage`，由宿主按消息类型决定打开标签、刷新标签或回包。

## iframe 页面内部使用 Client

宿主侧已经内置 iframe client 协议处理能力。协议属于插件内部约定：宿主负责识别请求、定位消息来源对应的 tab，并执行允许的当前页签动作；client 只是 iframe 侧的可选封装。

如果 iframe 页面也由你控制，并且希望业务逻辑写在 iframe 页面内部，可以使用轻量子入口 `@xsbcme/vue-tab-router/iframe-client`。

它解决的是“当前 iframe 想操作自己所属的 tab”的问题：宿主会根据 `postMessage` 的来源窗口自动定位 tab，不需要你在 iframe 内传 tabId，也不需要在全局 `iframe.onMessage` 里按页面来源写大量分支。

```ts
import { createIframeTabClient } from "@xsbcme/vue-tab-router/iframe-client";

const tabClient = createIframeTabClient();

const tab = await tabClient.getTab();
await tabClient.updateTabOptions({
  _viewName: `${tab.viewName || "Iframe"} · 已就绪`,
});

document.querySelector("#open-detail")?.addEventListener("click", () => {
  tabClient.openTab("/src/views/order/detail/page-index.vue", {
    _viewName: "订单详情",
    orderId: 1001,
  });
});

document.querySelector("#refresh")?.addEventListener("click", () => {
  tabClient.refreshTab();
});
```

没有构建工具的 iframe 页面可以直接引入浏览器 client 包。这个包是独立的，不需要先引入 Vue：

```html
<script src="https://unpkg.com/@xsbcme/vue-tab-router/dist/browser/iframe-client.global.js"></script>
<script>
  const tabClient = VueTabRouterIframeClient.createIframeTabClient();

  document.querySelector("#refresh")?.addEventListener("click", () => {
    tabClient.refreshTab();
  });
</script>
```

宿主仍然可以通过 `postIframeMessage` 给 iframe 发业务消息，iframe 内部用局部监听处理：

```ts
const stop = tabClient.on<{ type: "set-theme"; theme: string }>("set-theme", message => {
  document.documentElement.dataset.theme = message.theme;
});

window.addEventListener("beforeunload", () => {
  stop();
  tabClient.dispose();
});
```

注意：`iframe client` 不是用来让宿主页面调用的，也不是必须替代 `iframe.onMessage`。主包只负责内置协议和宿主能力，`createIframeTabClient()` 只从 `@xsbcme/vue-tab-router/iframe-client` 子入口导入。如果你的需求是“宿主统一接收所有 iframe 消息并集中处理”，继续使用上一节的 `postMessage` 方式更合适。Demo 中同时保留了 `Iframe 消息` 和 `Iframe Client` 两个案例，分别对应这两种模式。

## 加载后修改样式

`onIframeLoad` 会暴露 iframe 元素。跨域时只能操作 iframe 元素本身；同源时可以访问内部 `document`。

```ts
createTabsManager({
  views: {
    modules,
  },
  iframe: {
    onLoad({ iframe, tab }) {
      iframe.style.backgroundColor = "#fff";

      try {
        if (tab.viewProps?.iframeDemo && iframe.contentDocument) {
          const style = iframe.contentDocument.createElement("style");
          style.textContent = "body { outline: 4px solid rgba(22, 93, 255, .18); }";
          iframe.contentDocument.head.appendChild(style);
        }
      } catch {
        // 跨域 iframe 不能访问内部 document。
      }
    },
  },
});
```
