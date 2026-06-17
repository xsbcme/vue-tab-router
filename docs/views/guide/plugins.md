# 插件扩展

这一页适合在基础工作台已经稳定后阅读。插件更适合做埋点、日志、同步和横切扩展，不建议拿它承担页面本身的核心业务流程。

插件系统用于在不侵入业务页面的情况下监听标签页生命周期、接入埋点、权限日志、跨 iframe 指令等横切能力。

## 函数插件

```ts
const tabsManager = createTabsManager({
  views: {
    modules,
  },
  plugins: [
    ({ hooks }) => {
      hooks.on("tab:opened", tab => {
        console.log("opened", tab.viewUrl);
      });
    },
  ],
});
```

## 对象插件与清理

```ts
const analyticsPlugin = {
  name: "analytics",
  setup(ctx) {
    const off = ctx.hooks.on("tab:active-changed", tab => {
      sendPageView(tab.viewUrl);
    });

    ctx.onDispose(off);
  },
};
```

`setup` 返回函数也会作为清理函数执行。应用卸载时会清理插件和所有 hook。

## Hook 列表

| Hook                       | 触发时机                  |
| -------------------------- | ------------------------- |
| `tab:before-open`          | 新标签打开前              |
| `tab:opened`               | 新标签打开后              |
| `tab:before-active-change` | 激活标签切换前            |
| `tab:active-changed`       | 激活标签切换后            |
| `tab:before-close`         | 标签关闭前                |
| `tab:closed`               | 标签关闭后                |
| `tab:updated`              | 标签配置更新后            |
| `tab:before-refresh`       | 标签刷新前                |
| `tab:refreshed`            | 标签刷新后                |
| `tabs:cleared`             | 标签全部清空后            |
| `iframe:message`           | iframe 消息通过来源校验后 |

## 处理 iframe 指令

```ts
const iframeCommandPlugin = ({ hooks, tabsManager }) => {
  hooks.on("iframe:message", message => {
    const data = message.data;
    if (!data || typeof data !== "object") return;

    if (data.type === "iframe:open-tab" && typeof data.viewUrl === "string") {
      tabsManager.openTab(data.viewUrl, data.options ?? {});
      message.reply({ type: "host:opened", viewUrl: data.viewUrl });
    }
  });
};
```

## 与全局守卫的区别

全局守卫用于决定“是否允许继续”，返回 `false` 或抛错会中断流程。插件 hook 更适合记录、同步、通知和扩展，不建议在 hook 中承担核心业务校验。

Demo 的 `插件 Hooks` 页面会记录打开、切换、更新、刷新、关闭、清空和 iframe 消息等 hook。
