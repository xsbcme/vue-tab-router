# 基础页面导航

下面的 `tabsManager` 均指 `useTabsManager()` 获取到的实例（或选项式 API 中的 `this.$tabsManager`）。

## 打开页面：`openTab`

```ts
// 打开组件页面
await tabsManager.openTab("/src/views/about/page-index.vue");

// 打开时携带元信息 + 业务参数
await tabsManager.openTab("/src/views/about/page-index.vue", {
  _viewName: "关于页面",
  _viewIcon: "icon-info",
  _viewSingle: true,
  userId: 1001,
});
```

说明：

- 以下划线开头的是内置字段（如 `_viewName`、`_viewSingle`）
- 其他字段会进入 `tab.viewProps`，并作为组件 props 传入
- 当 `viewUrl + viewProps` 完全一致时，会复用已有标签而不是新开

## 激活指定标签：`changeActiveTab`

```ts
const target = tabsManager.tabs.find(tab => tab.viewName === "关于页面");
if (target) {
  await tabsManager.changeActiveTab(target._id);
}
```

## 刷新页面：`refreshTab` / `refreshTabAll`

```ts
// 刷新当前激活标签
await tabsManager.refreshTab();

// 刷新指定标签
await tabsManager.refreshTab("aXGc");

// 刷新所有标签
await tabsManager.refreshTabAll();
```

## 关闭页面：`closeTab` 与批量关闭

```ts
// 关闭当前标签
await tabsManager.closeTab();

// 关闭指定标签
await tabsManager.closeTab("aXGc");

// 关闭左侧 / 右侧 / 其他 / 全部
await tabsManager.closeTabsByLeft();
await tabsManager.closeTabsByRight();
await tabsManager.closeTabsByOther();
await tabsManager.closeTabByAll();
```

注意：

- 标签标记 `_noClose` 时默认不可关闭
- 关闭当前激活标签后，会优先尝试激活其来源标签（`_sourceId`）
