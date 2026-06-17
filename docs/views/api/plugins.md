# 插件与 hooks API

插件用于扩展 `TabsManager` 生命周期。内置的 URL 同步能力也是插件形式。

## TabsManagerPlugin

插件可以是函数，也可以是对象：

```ts
const plugin = ({ hooks, tabsManager, onDispose }) => {
  const off = hooks.on("tab:opened", tab => {
    console.log("opened", tab.viewName);
  });

  onDispose(off);
};
```

对象形式适合调试命名：

```ts
const plugin = {
  name: "logger",
  setup({ hooks }) {
    return hooks.on("tab:active-changed", tab => {
      console.log(tab.viewName);
    });
  },
};
```

注册插件：

```ts
createTabsManager({
  views: { modules },
  plugins: [plugin],
});
```

## TabsManagerPluginContext

| 字段                 | 说明                        |
| -------------------- | --------------------------- |
| `app`                | 当前 Vue 应用实例。         |
| `tabsManager`        | 响应式 `TabsManager` 实例。 |
| `hooks`              | hook 注册器。               |
| `onDispose(cleanup)` | 注册插件卸载时的清理函数。  |

## hooks.on(name, handler)

注册生命周期处理函数，返回取消注册函数。

```ts
const off = hooks.on("tab:updated", tab => {
  console.log(tab.viewName);
});

off();
```

处理函数返回 `false` 时会中断当前流程。通常用于 `tab:before-*` hooks。

## Hook 列表

| hook                       | 触发时机                                   |
| -------------------------- | ------------------------------------------ |
| `tab:before-open`          | 打开 tab 前。返回 `false` 可阻止打开。     |
| `tab:opened`               | tab 已打开后。                             |
| `tab:before-active-change` | 激活 tab 切换前。返回 `false` 可阻止切换。 |
| `tab:active-changed`       | 激活 tab 已切换后。                        |
| `tab:updated`              | tab 元信息已更新后。                       |
| `tab:before-close`         | 关闭 tab 前。返回 `false` 可阻止关闭。     |
| `tab:closed`               | tab 已关闭后。                             |
| `tab:before-refresh`       | 刷新 tab 前。返回 `false` 可阻止刷新。     |
| `tab:refreshed`            | tab 已刷新后。                             |
| `tab:detached-opened`      | tab 已进入弹窗显示。                       |
| `tab:detached-closed`      | 弹窗显示已关闭。                           |
| `tab:detached-error`       | 弹窗显示容器渲染失败。                     |
| `iframe:message`           | iframe 通过 postMessage 向宿主发送消息。   |
| `tabs:cleared`             | 全部 tab 状态被清空后。                    |

## 全局守卫

全局守卫配置在 `createTabsManager({ guards })` 中：

```ts
createTabsManager({
  views: { modules },
  guards: {
    beforeOpen(to, from) {
      if (!hasPermission(to.viewUrl)) return false;
    },
    beforeLeave(to, from) {
      if (hasUnsavedChanges(from)) return false;
    },
    beforeClose(tab) {
      return confirm(`关闭 ${tab.viewName}？`);
    },
  },
});
```

返回 `false`、抛错或返回 rejected Promise 会阻止流程。

## createTabUrlSyncPlugin(router, options?)

地址栏同步插件。用于把当前激活 tab 写入外层路由 query，并支持刷新或复制链接后恢复 tab。

```ts
import { createTabUrlSyncPlugin } from "@xsbcme/vue-tab-router/plugins/tab-url-sync";

createTabUrlSyncPlugin(router, {
  routePath: "/dashboard",
  queryKey: "activeTab",
  allowExternal: false,
});
```

配置：

| 字段                   | 默认值         | 说明                                                                                                  |
| ---------------------- | -------------- | ----------------------------------------------------------------------------------------------------- |
| `queryKey`             | `"tab"`        | 存储当前激活 tab 状态的 query 参数名。                                                                |
| `routePath`            | 不限制         | 只在指定外层路由上同步。                                                                              |
| `historyMode`          | `"push"`       | 打开或切换标签时写入历史的方式。                                                                      |
| `syncInitialActiveTab` | `true`         | URL 没有 tab 状态但已有 active tab 时，是否补齐 URL。                                                 |
| `syncDocumentTitle`    | `true`         | 是否跟随 active tab 更新浏览器标题。                                                                  |
| `formatDocumentTitle`  | 无             | 自定义浏览器标题。                                                                                    |
| `allowExternal`        | `false`        | 是否允许 URL 打开 http/https 外部 iframe 页面。                                                       |
| `allowRelative`        | `true`         | 是否允许 URL 打开相对 iframe 页面。                                                                   |
| `syncIframeNavigation` | `true`         | 是否同步同源 iframe 内部链接导航后的当前地址。                                                        |
| `serialize`            | base64url JSON | 写入 URL 前自定义序列化。                                                                             |
| `deserialize`          | base64url JSON | 从 URL 读取后自定义反序列化。                                                                         |
| `validate`             | 无             | 从 URL 打开 tab 前校验。                                                                              |
| `onError`              | 无             | 同步失败回调。未配置时会使用 `TabsManagerOptions.logger` 的 `error` 方法输出 `URL_SYNC_FAILED` 错误。 |

自定义标题：

```ts
import { createTabUrlSyncPlugin } from "@xsbcme/vue-tab-router/plugins/tab-url-sync";

createTabUrlSyncPlugin(router, {
  formatDocumentTitle(tab) {
    return tab?.viewName ? `${tab.viewName} - 管理后台` : "管理后台";
  },
});
```

安全校验：

```ts
import { createTabUrlSyncPlugin } from "@xsbcme/vue-tab-router/plugins/tab-url-sync";

createTabUrlSyncPlugin(router, {
  validate(state) {
    return state.viewUrl.startsWith("/src/views/");
  },
});
```

更多使用场景见 [地址栏同步与浏览器历史](/views/guide/url-sync)。
