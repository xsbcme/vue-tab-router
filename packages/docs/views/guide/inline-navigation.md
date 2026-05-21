# 内联页面导航（iframe）

当 `viewUrl` 是链接地址时，`DynamicContainerComponent` 会使用 `iframe` 渲染页面。

## 可识别的链接形式

- `http://` 或 `https://`
- `realtive:` 前缀（历史拼写，注意不是 `relative:`）

```ts
await tabsManager.openTab("https://example.com/docs", {
  _viewName: "外部文档",
  lang: "zh-CN",
});

await tabsManager.openTab("realtive:/micro-app/index.html", {
  _viewName: "子应用",
  tenantId: "t1",
});
```

`lang`、`tenantId` 这类业务参数会作为查询参数拼接到 iframe 的 URL 上。

## iframe 加载回调

可以在初始化时注册 `onIframeLoad`：

```ts
const tabsManager = createTabsManager({
  modules,
  onIframeLoad(e, tab) {
    console.log("iframe loaded =>", tab.viewUrl, e);
  },
});
```

常见用途：

- 埋点上报（页面加载时机）
- 对特定链接页签做额外处理
- 诊断外部页面加载失败问题
