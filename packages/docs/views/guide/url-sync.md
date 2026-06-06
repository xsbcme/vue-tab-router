# 地址栏同步与浏览器历史

`VueTabRouter` 默认不改写地址栏，适合在工作台内部独立管理多标签页。若希望复制链接后能直达某个标签页，或让浏览器前进/后退切换激活标签，可以使用 `createTabUrlSyncPlugin`。

## 基础用法

```ts
import { createTabsManager, createTabUrlSyncPlugin } from "@xsbcme/vue-tab-router";
import router from "@/router";

const tabsManager = createTabsManager({
  views: {
    modules,
  },
  plugins: [
    createTabUrlSyncPlugin(router, {
      routePath: "/dashboard",
    }),
  ],
});
```

启用后，插件会把当前激活标签写入外层路由的 query：

```txt
/#/dashboard?tab=...
```

刷新或直接访问带 `tab` 参数的地址时，插件会读取参数并调用 `tabsManager.openTab(viewUrl, options)` 打开对应标签。

## 传递页面参数

URL 状态包含：

- `viewUrl`
- `viewName`
- `viewIcon`
- `viewNoCache`
- `viewSingle`
- `viewProps`

因此下面的标签可以通过地址栏恢复：

```ts
tabsManager.openTab("/src/views/order/detail/page-index.vue", {
  _viewName: "订单详情",
  id: 1001,
  mode: "readonly",
});
```

恢复时会重新调用：

```ts
tabsManager.openTab(viewUrl, {
  _viewName,
  _viewIcon,
  _viewNoCache,
  _viewSingle,
  ...viewProps,
});
```

## 浏览器前进后退

默认策略：

- 首次写入 `tab` 参数时使用 `replace`
- 后续打开或切换标签时使用 `push`
- 更新、关闭、清空标签时使用 `replace`

因此浏览器前进/后退会在历史中的激活标签之间切换。URL 只表达当前激活标签，不表达完整标签列表；完整标签列表仍由存储适配器负责持久化。

## 安全控制

地址栏可被用户修改，建议限制可打开的页面：

```ts
createTabUrlSyncPlugin(router, {
  routePath: "/dashboard",
  allowExternal: false,
  allowRelative: true,
  validate(state) {
    return state.viewUrl.startsWith("/src/views/");
  },
});
```

默认不允许从 URL 打开 `http` / `https` 外部 iframe。相对 iframe 地址默认允许；如需禁用，可设置 `allowRelative: false`。

## 自定义参数名

```ts
createTabUrlSyncPlugin(router, {
  queryKey: "activeTab",
});
```

## 自定义序列化

默认使用 base64url 编码 JSON。若需要更可读或与后端约定兼容，可以自定义：

```ts
createTabUrlSyncPlugin(router, {
  serialize(state) {
    return JSON.stringify(state);
  },
  deserialize(value) {
    const state = JSON.parse(value);
    return typeof state.viewUrl === "string" ? state : undefined;
  },
});
```

## 注意事项

- 不建议把随机 `_id` 写入 URL；刷新后 `_id` 不稳定。
- 不建议第一版同步完整 tabs 列表；关闭、排序、缓存和守卫都会让 URL 状态复杂化。
- 如果 URL 中的目标组件未注册，`openTab` 会抛出“视图未注册”，可通过 `onError` 接收错误。
