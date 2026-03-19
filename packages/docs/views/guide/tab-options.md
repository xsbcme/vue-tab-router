# 页面元信息与更新

`VueTabRouter` 的标签页由两部分数据组成：

- **元信息**：标题、图标、单例、缓存等行为字段
- **业务参数**：传给页面组件的 props

## 打开时设置

```ts
await tabsManager.openTab('/src/views/user/page-index.vue', {
  _viewName: '用户详情',
  _viewIcon: 'icon-user',
  _viewSingle: true,
  _viewNoCache: false,
  userId: 1001
});
```

## 页面内部声明：`defineTabOptions`

适合“页面自己决定标题/图标/缓存策略”的场景：

```ts
import { defineTabOptions } from '@xsbcme/vue-tab-router';

defineTabOptions({
  viewName: '用户详情',
  viewIcon: 'icon-user',
  viewSingle: true,
  viewNoCache: false
});
```

## 运行中更新：`updateTabOptions`

```ts
await tabsManager.updateTabOptions({
  _viewName: '用户详情（已保存）',
  _viewIcon: 'icon-check',
  status: 'saved'
});
```

说明：

- 你可以只更新部分字段
- 非下划线字段会浅合并到 `viewProps`
- 不传 `tabId` 时默认更新当前激活标签

## 单例与多开的行为

- `_viewSingle: true`：同一路径优先复用
- `_viewSingle: false`：允许同一路径多开（通过不同 `viewProps` 区分）

> [!TIP]
> 复用判断的第一优先级是 `viewUrl + viewProps` 的完整匹配。
