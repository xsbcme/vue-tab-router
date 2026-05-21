# 外链导航（新窗口）

当你希望链接在浏览器新标签页或新窗口打开时，使用 `_viewOutside: true`。

```ts
const opened = await tabsManager.openTab("https://example.com", {
  _viewOutside: true,
  _viewOutsideProps: {
    target: "_blank",
    features: "noopener,noreferrer",
  },
});
```

## 行为说明

- 内部调用 `window.open`
- 不会创建 VueTabRouter 内部标签页
- 返回值为 `Promise<Window>`

## 适用场景

- 第三方系统跳转
- 文档、报表、监控等外部地址
- 避免 iframe 跨域限制的页面

> [!TIP]
> 对链接页面，如果不设置 `_viewOutside`，则会走“内联 iframe 页面”模式，见 [内联页面导航](/views/guide/inline-navigation)。
