# 内置插件

内置插件是核心包提供的可选扩展能力。它们和自定义插件使用同一个 `plugins` 注册机制，但不从主入口导出，而是放在独立的插件域子入口中。

这样设计有两个目的：

- 不使用时不会进入 `@xsbcme/vue-tab-router` 主入口依赖图。
- 后续新增官方插件时，可以统一放在 `@xsbcme/vue-tab-router/plugins/*` 命名空间下。

## 当前内置插件

| 插件                       | 导入入口                                      | 用途                          |
| -------------------------- | --------------------------------------------- | ----------------------------- |
| `createTabUrlSyncPlugin()` | `@xsbcme/vue-tab-router/plugins/tab-url-sync` | 同步激活 tab 到外层路由 query |

## 地址栏同步插件

`createTabUrlSyncPlugin(router, options?)` 用于把当前激活 tab 写入外层路由 query，并支持刷新恢复、复制链接直达、浏览器前进/后退切换激活 tab。

```ts
import { createTabsManager } from "@xsbcme/vue-tab-router";
import { createTabUrlSyncPlugin } from "@xsbcme/vue-tab-router/plugins/tab-url-sync";
import router from "@/router";

const tabsManager = createTabsManager({
  views: {
    modules,
  },
  plugins: [
    createTabUrlSyncPlugin(router, {
      routePath: "/dashboard",
      queryKey: "activeTab",
    }),
  ],
});
```

启用后，当前激活标签会写入外层路由 query：

```txt
/#/dashboard?activeTab=...
```

刷新或直接访问带参数的地址时，插件会读取 URL 状态并重新打开对应 tab。

## 参数

| 参数                   | 默认值         | 说明                                                                                                |
| ---------------------- | -------------- | --------------------------------------------------------------------------------------------------- |
| `queryKey`             | `"tab"`        | 存储当前激活 tab 状态的 query 参数名。                                                              |
| `routePath`            | 不限制         | 只在指定外层路由上同步，例如 `/dashboard`。                                                         |
| `historyMode`          | `"push"`       | 打开或切换标签时写入历史的方式；首次写入会自动改用 `replace`。                                      |
| `syncInitialActiveTab` | `true`         | URL 没有 tab 状态但已有 active tab 时，是否补齐 URL。                                               |
| `syncDocumentTitle`    | `true`         | 是否跟随当前 active tab 更新浏览器标题。                                                            |
| `formatDocumentTitle`  | 无             | 自定义浏览器标题格式。                                                                              |
| `allowExternal`        | `false`        | 是否允许 URL 打开 `http` / `https` 外部 iframe 页面。                                               |
| `allowRelative`        | `true`         | 是否允许 URL 打开 `TabViewUrl.createRelative()` 创建的相对 iframe 页面。                            |
| `syncIframeNavigation` | `true`         | 是否同步同源 iframe 内部链接导航后的当前地址。                                                      |
| `serialize`            | base64url JSON | 写入 URL 前自定义序列化。                                                                           |
| `deserialize`          | base64url JSON | 从 URL 读取后自定义反序列化。                                                                       |
| `validate`             | 无             | 从 URL 打开 tab 前的自定义校验。                                                                    |
| `onError`              | 无             | 同步失败回调；未配置时使用 `TabsManagerOptions.logger` 的 `error` 方法输出 `URL_SYNC_FAILED` 错误。 |

## 推荐配置

后台工作台通常建议限制同步路由，并使用业务可读的 query key：

```ts
createTabUrlSyncPlugin(router, {
  routePath: "/dashboard",
  queryKey: "activeTab",
});
```

如果地址可能被用户手动修改，建议加上校验：

```ts
createTabUrlSyncPlugin(router, {
  routePath: "/dashboard",
  validate(state) {
    return state.viewUrl.startsWith("/src/views/");
  },
});
```

如果需要自定义浏览器标题：

```ts
createTabUrlSyncPlugin(router, {
  formatDocumentTitle(tab) {
    return tab?.viewName ? `${tab.viewName} - 管理后台` : "管理后台";
  },
});
```

## 注意事项

- URL 只表达当前激活 tab，不表达完整 tab 列表；完整列表仍由存储适配器负责。
- 不建议把随机 `_id` 写入 URL，刷新后 `_id` 不稳定。
- 默认不允许从 URL 打开 `http` / `https` 外部 iframe；确实需要时再开启 `allowExternal`。
- 如果目标组件未注册，恢复时会触发打开失败，可通过 `onError` 收集错误。

更完整的场景说明见 [地址栏同步与浏览器历史](/views/guide/url-sync)，底层 API 参考见 [插件与 hooks API](/views/api/plugins)。
