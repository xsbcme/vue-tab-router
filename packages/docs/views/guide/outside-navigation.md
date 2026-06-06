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
- 返回值为 `Promise<Window | null>`

如果浏览器拦截弹窗，返回值可能是 `null`。

## 适用场景

- 第三方系统跳转
- 文档、报表、监控等外部地址
- 避免 iframe 跨域限制的页面

> [!TIP]
> 对链接页面，如果不设置 `_viewOutside`，则会走“内联 iframe 页面”模式，见 [内联页面导航](/views/guide/inline-navigation)。

## 与内部 iframe 的区别

| 打开方式 | 是否创建内部 tab | 是否受 iframe 跨域限制 | 适合场景 |
| --- | --- | --- | --- |
| 不传 `_viewOutside` | 是 | 是 | 希望在工作台内嵌入展示。 |
| `_viewOutside: true` | 否 | 否 | 第三方系统、报表、监控页面、下载页。 |

## 安全建议

新窗口打开外部链接时，建议设置 `noopener,noreferrer`：

```ts
await tabsManager.openTab("https://example.com", {
  _viewOutside: true,
  _viewOutsideProps: {
    target: "_blank",
    features: "noopener,noreferrer",
  },
});
```

如果链接来自用户输入，需要先做白名单校验，避免把不可信 URL 直接交给 `window.open`。
