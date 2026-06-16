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
tabsManager.postIframeMessage({ type: "host:active-message" });
```

向指定 iframe tab 发送：

```ts
tabsManager.postIframeMessage({ type: "host:tab-id-message" }, undefined, tabId);
```

在当前页面组件内部发送：

```ts
import { useIframeMessenger } from "@xsbcme/vue-tab-router";

const iframeMessenger = useIframeMessenger();

iframeMessenger.postMessage({ type: "page:message" });
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

## Iframe Controller

如果希望 iframe 的业务配置跟随某个 Vue 页面组件维护，可以使用 iframe controller。它解决的是“iframe 页面的宿主侧逻辑不想都写在全局 `iframe.onMessage` 里”的问题：每个 iframe tab 可以有自己的隐藏 controller 组件，局部声明 iframe 地址、样式、加载回调和消息处理。

这个模式有两个运行层：

| 层级 | 说明 |
| --- | --- |
| controller 组件 | 一个已注册的 Vue 页面组件，隐藏挂载在当前 tab 内，用 `defineIframeOptions()` 声明局部 iframe 配置。 |
| iframe 内容 | 用户真正看到的 iframe 页面，地址来自 `createIframeController(controllerUrl, iframeSrc)` 的第二个参数，或 controller 内部的 `defineIframeOptions({ src })`。 |

也就是说，打开的是一个 controller tab，但显示的是 iframe 内容。controller 不是运行在 iframe 里面的代码，而是宿主应用里的 Vue 控制层。

```ts
import { TabViewUrl, useTabsManager } from "@xsbcme/vue-tab-router";

const tabsManager = useTabsManager();

tabsManager.openTab(
  TabViewUrl.createIframeController(
    "/src/views/report/controller/page-index.vue",
    TabViewUrl.createRelative("./iframe-tests/message.html")
  ),
  {
    _viewName: "报表 Iframe",
    reportId: 1001,
  }
);
```

参数归属需要明确区分：

| 参数 | 归属 |
| --- | --- |
| `controllerUrl` | controller 组件路径，必须存在于 `views.modules` 注册表中。 |
| `iframeSrc` | 默认 iframe 地址，会被 `TabViewUrl.resolveIframe()` 解析后传给 iframe。 |
| `viewUrl` query | `iframe-controller:<controllerUrl>?src=<iframeSrc>&...` 中除 `src` 以外的查询参数，会作为打开参数合并进当前 tab。 |
| `openTab` 第二个参数 | 当前 tab 的打开参数；优先级高于 `viewUrl` query，去掉 `_viewName` 等内置字段后保存为 `viewProps`，并作为 iframe 查询参数透传。 |
| `defineIframeOptions({ src })` | controller 内部覆盖 iframe 地址，也会被 `TabViewUrl.resolveIframe()` 解析，优先级高于 `iframeSrc`。 |
| `defineIframeOptions({ messageOrigins })` | 当前 controller tab 的局部消息来源校验；不传时使用全局 `iframe.messageOrigins`。 |

`createIframeController(controllerUrl, iframeSrc?)` 会生成普通 URL 查询参数结构：

```txt
iframe-controller:/src/views/report/controller/page-index.vue?src=relative%3A.%2Fiframe-tests%2Fmessage.html
```

如果第三方系统或外部菜单只能配置一个链接，也可以直接手写这个结构：

```txt
iframe-controller:/src/views/report/controller/page-index.vue?src=relative%3A.%2Fiframe-tests%2Fmessage.html&reportId=1001&mode=preview
```

解码后的含义是：

| 片段 | 含义 |
| --- | --- |
| `iframe-controller:` | 声明这是 iframe controller tab。 |
| `/src/views/report/controller/page-index.vue` | 宿主侧隐藏挂载的 controller 组件。 |
| `src=relative:./iframe-tests/message.html` | 默认 iframe 地址。 |
| `reportId=1001&mode=preview` | 业务参数，会进入 `viewProps`，controller 可读，也会透传给 iframe。 |

因此，如果 iframe 页面需要通过 URL 收到业务参数，可以把业务参数传给 `openTab`：

```ts
const iframeSrc = TabViewUrl.createRelative("./iframe-tests/message.html");

tabsManager.openTab(TabViewUrl.createIframeController(controllerUrl, iframeSrc), {
  _viewName: "报表 Iframe",
  reportId: 1001,
});
```

最终传给 iframe 的地址类似：

```txt
./iframe-tests/message.html?reportId=1001
```

也可以把业务参数直接写进单链接，适合后端菜单或第三方系统配置：

```txt
iframe-controller:/src/views/report/controller/page-index.vue?src=relative%3A.%2Fiframe-tests%2Fmessage.html&reportId=1001
```

如果 `iframeSrc` 或 controller 内部 `src` 本身已经带有查询参数，`viewProps` 会作为默认参数合并进去；同名参数以 `src` 中已有值为准，数组会展开为多个同名查询参数，`null` 和 `undefined` 不会写入 URL：

```ts
tabsManager.openTab(
  TabViewUrl.createIframeController(
    controllerUrl,
    TabViewUrl.createRelative("./iframe-tests/message.html?mode=preview#ready")
  ),
  {
    _viewName: "报表 Iframe",
    reportId: 1001,
    tags: ["daily", "finance"],
  }
);
```

最终 iframe 地址类似：

```txt
./iframe-tests/message.html?mode=preview&reportId=1001&tags=daily&tags=finance#ready
```

如果 `src` 自身包含 `?`、`&`、`#`，写在单链接里时需要按标准 URL query 参数编码：

```txt
iframe-controller:/src/views/report/controller/page-index.vue?src=relative%3A.%2Fiframe-tests%2Fmessage.html%3Fmode%3Dpreview%23ready&reportId=1001
```

最终 iframe 地址类似：

```txt
./iframe-tests/message.html?mode=preview&reportId=1001#ready
```

如果 controller 需要根据业务参数修改 iframe 地址，可以在 controller 组件中读取当前 tab，然后用 `defineIframeOptions({ src })` 计算最终地址：

```vue
<script setup lang="ts">
import { computed } from "vue";
import { defineIframeOptions, useTabId, useTabsManager } from "@xsbcme/vue-tab-router";

const tabId = useTabId();
const tabsManager = useTabsManager();

defineIframeOptions({
  src: computed(() => {
    const reportId = tabsManager.getTabById(tabId)?.viewProps?.reportId;
    const url = new URL("./iframe-tests/message.html", window.location.href);
    url.searchParams.set("mode", "readonly");
    if (reportId) url.searchParams.set("reportId", String(reportId));
    return `relative:${url.pathname}${url.search}${url.hash}`;
  }),
});
</script>
```

controller 计算出的 `src` 优先级最高。同名参数已经写在最终 `src` 里时，外层 `viewProps` 不会覆盖它；外层参数只会补充 `src` 中不存在的查询参数。

controller 组件内部：

```vue
<template></template>

<script setup lang="ts">
import { defineIframeOptions } from "@xsbcme/vue-tab-router";

defineIframeOptions({
  styles: "body { outline: 4px solid rgba(22, 93, 255, .18); }",
  onLoad({ tab }) {
    console.log("iframe loaded", tab.viewName);
  },
  onMessage(message) {
    if (message.data?.type === "page:message") {
      message.reply({ type: "controller:received" });
      return false;
    }
  },
});
</script>
```

也可以把 iframe 地址完全写在 controller 组件里，打开时只传 controller 路径：

```ts
tabsManager.openTab(TabViewUrl.createIframeController("/src/views/report/baidu/page-index.vue"), {
  _viewName: "百度 Iframe",
});
```

```ts
defineIframeOptions({
  src: "https://www.baidu.com",
});
```

设计边界：

- `defineIframeOptions()` 只在 iframe controller tab 的控制组件内生效。
- controller 组件需要像普通页面一样注册到 `views.modules`，推荐使用 `page-index.vue` 作为入口。
- 无界面的 controller 组件也建议保留空 `<template></template>`，避免 Vue 报缺少 render/template 的警告。
- `styles` 在 iframe 真实 `load` 后注入；同源 iframe 可以注入，跨域 iframe 会跳过内部 `document` 操作。
- controller `onLoad` 在局部样式注入后执行，然后才执行全局 `iframe.onLoad` 和 `iframe:load` hook。
- controller `messageOrigins` 只影响当前 iframe controller tab；未配置时继续使用全局 `iframe.messageOrigins`，全局也未配置时只允许同源消息。
- controller `onMessage` 先于全局 `iframe.onMessage` 执行；返回 `false` 会阻止全局处理和 `iframe:message` hook。
- 宿主向 iframe 发消息统一使用 `postIframeMessage(data, options?, tabId?)`；页面组件内部可用 `useIframeMessenger()` 自动绑定当前 tab，controller `onMessage` 处理的是 iframe 发给宿主的消息。
- 普通切换不会清理 controller 配置；关闭 tab、刷新 iframe tab 或清空全部 tab 会释放 iframe 引用和 controller 配置。

适用选择：

| 场景 | 推荐方式 |
| --- | --- |
| iframe 页面自己控制当前 tab，例如刷新、关闭、打开子页 | iframe client。 |
| 宿主统一处理所有 iframe 消息 | 全局 `iframe.onMessage`。 |
| 某个 iframe tab 有独立样式、加载和消息处理逻辑 | iframe controller。 |

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
