# 常见问题

## 打开页面时报“视图未注册”？

通常是 `openTab(viewUrl)` 传入值与 `modules` 的 key 不一致。  
请打印 `Object.keys(modules)`，确认两者完全一致。

## 为什么 `relative:` 前缀不生效？

当前版本历史前缀是 `realtive:`（拼写沿用旧版本）。  
请使用 `realtive:/path`。

## 为什么内置 `DynamicTabsComponent` 样式不完整？

它基于 Arco Design 组件实现，项目需要正确安装并引入 Arco 相关依赖/样式。

## 页面切换时如何阻止离开？

在页面组件里注册：

```ts
onBeforeTabLeave(async () => {
  if (!canLeave) return Promise.reject(new Error('blocked'));
});
```

## 想在刷新后恢复标签页，用什么存储？

默认是 `sessionStorage`。若希望跨会话恢复，可自定义 `storageAdapter` 使用 `localStorage`。
