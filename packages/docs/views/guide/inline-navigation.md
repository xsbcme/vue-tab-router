# 内联页面导航（iframe）

当 `viewUrl` 是链接地址时，`DynamicContainerComponent` 会使用 `iframe` 渲染页面。

## 可识别的链接形式

- `http://` 或 `https://`
- `TabViewUrl.createRelative()` 创建的相对地址

```ts
import { TabViewUrl } from "@xsbcme/vue-tab-router";

await tabsManager.openTab("https://example.com/docs", {
  _viewName: "外部文档",
  lang: "zh-CN",
});

await tabsManager.openTab(TabViewUrl.createRelative("/micro-app/index.html"), {
  _viewName: "子应用",
  tenantId: "t1",
});
```

`lang`、`tenantId` 这类业务参数会作为查询参数拼接到 iframe 的 URL 上。

## iframe 加载回调

可以在初始化时注册 `onIframeLoad`：

```ts
const tabsManager = createTabsManager({
  views: {
    modules,
  },
  iframe: {
    onLoad({ event, iframe, tab }) {
      console.log("iframe loaded =>", tab.viewUrl, event);
      iframe.style.backgroundColor = "#fff";
    },
  },
});
```

常见用途：

- 埋点上报（页面加载时机）
- 对特定链接页签做额外处理
- 同源 iframe 内部样式注入
- 诊断外部页面加载失败问题
