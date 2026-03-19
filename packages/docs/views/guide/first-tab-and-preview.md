# 首页与预览容器方案

## 首页标签：`openFristTab`

`openFristTab`（历史命名，保持兼容）用于打开并固定首页标签，首页会被标记为不可关闭。

```ts
await tabsManager.openFristTab(
  '/src/views/home/page-index.vue',
  { _viewName: '首页' },
  'replace'
);
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

`PreviewContainerComponent` 适合“只预览一个页面”的场景，会先清空旧页签再打开目标页。

```vue
<template>
  <PreviewContainerComponent
    view-url="/src/views/report/page-index.vue"
    :view-props="{ reportId: 1001 }"
    view-name="报表预览"
  />
</template>

<script setup lang="ts">
import { PreviewContainerComponent } from '@xsbcme/vue-tab-router';
</script>
```

## 典型应用场景

- 后台系统默认首页固定不关闭
- “单页预览模式”用于嵌入其他壳系统
- 临时预览页避免污染当前工作标签组
