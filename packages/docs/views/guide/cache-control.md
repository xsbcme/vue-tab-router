# 页面缓存控制

`VueTabRouter` 默认基于增强版 keep-alive 缓存页面，这意味着：

- 首次打开页面触发 `onMounted`
- 在标签间切换主要触发 `onActivated` / `onDeactivated`

## 关闭单页缓存

打开页面时设置 `_viewNoCache: true`：

```ts
await tabsManager.openTab('/src/views/report/page-index.vue', {
  _viewName: '报表页面',
  _viewNoCache: true
});
```

也可以在页面内部声明：

```ts
import { defineTabOptions } from '@xsbcme/vue-tab-router';

defineTabOptions({
  viewNoCache: true
});
```

## 主动刷新页面

```ts
// 刷新当前页
await tabsManager.refreshTab();

// 刷新指定页
await tabsManager.refreshTab(tabId);

// 刷新全部
await tabsManager.refreshTabAll();
```

`refreshTab` 的行为是临时标记 `_isRefresh` 后重建当前页面实例。

## keep-alive 最大缓存数

通过 `keepAliveProps.max` 限制缓存上限：

```ts
const tabsManager = createTabsManager({
  modules,
  keepAliveProps: {
    max: 20
  }
});
```

## 实践建议

- 数据编辑页：建议启用缓存 + 配置离开守卫
- 大图/重页面：可关闭缓存，降低内存占用
- 与服务端强一致页面：使用 `refreshTab` 触发重拉数据