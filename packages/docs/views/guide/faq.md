# 常见问题

## 打开页面时报“视图未注册”？

通常是 `openTab(viewUrl)` 传入值与 `modules` 的 key 不一致。  
请打印 `Object.keys(modules)`，确认两者完全一致。

## 相对链接应该使用什么前缀？

当前源码使用 `relative:` 前缀。示例：`relative:/micro-app/index.html`。

## 为什么内置 `DynamicTabsComponent` 样式不完整？

请确认没有被业务全局样式覆盖。标签栏本身使用组件内置样式，并可通过 CSS 变量定制主题。

## 页面切换时如何阻止离开？

在页面组件里注册：

```ts
onBeforeTabLeave(async () => {
  if (!canLeave) return false;
});
```

## 想在刷新后恢复标签页，用什么存储？

默认是 `sessionStorage`。若希望跨会话恢复，可自定义 `storageAdapter` 使用 `localStorage`。

## Demo 项目在哪里？

Demo 已迁移到当前仓库的 `packages/demo`，可以执行 `pnpm dev:demo` 启动。
