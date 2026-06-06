# 首页与预览容器方案

## 首页标签：`openFirstTab`

`openFirstTab` 用于打开并固定首页标签，首页会被标记为不可关闭。

```ts
await tabsManager.openFirstTab("/src/views/home/page-index.vue", { _viewName: "首页" }, "replace");
```

`mode` 支持：

- `clear`：清空后再打开首页
- `replace`：替换现有首页（默认）
- `move`：将目标页签移动到首位

首页会被标记为 `_isFirst=true` 且 `_noClose=true`，内置标签栏不会允许用户直接关闭它。

## 登录后打开首页

后台系统常见做法是在登录成功后打开首页，然后进入工作台：

```ts
async function login() {
  await tabsManager.openFirstTab("/src/views/home/page-index.vue", {
    _viewName: "首页",
  });

  router.replace("/dashboard");
}
```

如果使用地址栏同步插件，进入 `/dashboard` 后会自动补齐当前首页 tab 的 URL 状态。

## 激活首页：`activeFirstTab`

```ts
await tabsManager.activeFirstTab();
```

## 预览容器：`PreviewContainerComponent`

`PreviewContainerComponent` 适合 A 系统页面被 B 系统嵌入操作的场景。它会把 `viewUrl` 打开为预览容器的首页标签，默认标题为“首页”，且默认不显示在上方标签栏；当这个页面继续打开其它页面时，才显示上方标签栏。`viewUrl`、`viewProps` 或 `viewName` 变化时会清空旧页签并重新打开预览页；关闭或打开失败时会触发 `error` 事件。

```vue
<template>
  <PreviewContainerComponent
    view-url="/src/views/report/page-index.vue"
    :view-props="{ reportId: 1001 }"
    view-name="报表预览"
    @error="handlePreviewError"
  />
</template>

<script setup lang="ts">
import { PreviewContainerComponent } from "@xsbcme/vue-tab-router";

const handlePreviewError = (error: unknown) => {
  console.error(error);
};
</script>
```

## 预览容器与主工作台的关系

预览容器内部使用 scoped manager：

- 复用根实例的页面模块注册和异步组件配置。
- 拥有独立的 tabs、activeTab、事件中心和 iframe 状态。
- 默认关闭持久化，不会污染主工作台的标签组。

因此它适合“在一个局部区域临时预览某个页面”的场景，而不是替代主工作台容器。

## 典型应用场景

- 后台系统默认首页固定不关闭
- “单页预览模式”用于嵌入其他壳系统
- 临时预览页避免污染当前工作标签组

## 使用建议

- 主工作台用 `DynamicTabsComponent + DynamicContainerComponent`。
- 详情弹层、抽屉、外部嵌入场景用 `PreviewContainerComponent`。
- 需要独立持久化时，可改用 `tabsManager.createScopedManager()` 自行创建局部实例。
