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

## 典型应用场景

- 后台系统默认首页固定不关闭
- “单页预览模式”用于嵌入其他壳系统
- 临时预览页避免污染当前工作标签组
