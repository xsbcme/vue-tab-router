# 常见问题

## 打开页面时报“视图未注册”？

通常是 `openTab(viewUrl)` 传入值与 `modules` 的 key 不一致。请打印 `Object.keys(modules)`，确认两者完全一致。

Vite 项目里，下面这个配置生成的 key 通常是 `/src/views/.../page-index.vue`：

```ts
const modules = import.meta.glob("@/views/**/page-index.vue", { eager: false });
```

因此打开页面也要使用同样的 key：

```ts
await tabsManager.openTab("/src/views/order/page-index.vue");
```

非 Vite 项目可以手写稳定 key：

```ts
createTabsManager({
  views: {
    modules: {
      "order-page": OrderPage,
    },
  },
});

await tabsManager.openTab("order-page");
```

## import.meta.glob 可以直接写 @moduleA/src/views 吗？

不一定。`import.meta.glob()` 的参数必须是当前 Vite 项目真实可解析的路径：

- 相对路径，例如 `./modules/sales/views/**/page-index.vue`
- 绝对路径，例如 `/src/views/**/page-index.vue`
- 已在 `vite.config.ts` 中配置过的别名，例如 `@/views/**/page-index.vue`

如果项目里没有配置 `@moduleA` 别名，`import.meta.glob("@moduleA/src/views/**/page-index.vue")` 就不是一个有效扫描路径。

跨模块推荐做法是先按真实路径扫描，再规范化 key：

```ts
function normalizeViewKeys(modules: Record<string, unknown>, moduleName: string, baseDir: string) {
  return Object.fromEntries(
    Object.entries(modules).map(([key, value]) => [`@${moduleName}/${key.replace(baseDir, "")}`, value])
  );
}

const salesViews = import.meta.glob("./modules/sales/views/**/page-index.vue");

const modules = normalizeViewKeys(salesViews, "sales", "./modules/sales/");
```

依赖包页面也一样：先让 Vite 能解析到依赖包里的页面目录，再把扫描结果转换成项目约定的 key。建议开发时打印 `Object.keys(modules)`，确保菜单、`views.meta` 和 `openTab()` 使用的是同一套 key。

## 登录成功进入 dashboard 后没有 activeTab 参数？

如果使用 `createTabUrlSyncPlugin`，默认会补齐当前激活 tab 的 URL 状态。常见失效原因有三个：

- `routePath` 与当前外层路由不匹配，例如配置 `/dashboard`，但当前还在 `/login`。
- 还没有打开任何 tab，`tabsManager.activeTab` 是空。
- 手动设置了 `syncInitialActiveTab: false`。

推荐登录流程是先打开首页，再跳转工作台：

```ts
await tabsManager.openFirstTab("/src/views/home/page-index.vue", {
  _viewName: "首页",
});

router.replace("/dashboard");
```

进入 `/dashboard` 后，插件会用 `replace` 补齐 `?tab=...` 或自定义 query key。

## 浏览器标签页标题为什么没有跟着 tab 变化？

需要启用 URL 同步插件的标题同步能力。该能力默认开启：

```ts
createTabUrlSyncPlugin(router, {
  syncDocumentTitle: true,
  formatDocumentTitle(tab) {
    return tab?.viewName ? `${tab.viewName} - 管理后台` : "管理后台";
  },
});
```

如果没有 `viewName`，默认会回退到 `viewUrl`。

## views.meta 和菜单有什么区别？

菜单是导航入口，`views.meta` 是页面元数据。

建议这样分工：

- 菜单只放用户左侧可点击的入口。
- `views.meta` 放页面默认标题、图标、默认打开参数和详情页层级。
- 非菜单详情页、编辑页的面包屑层级优先放在 `views.meta`。

这样不会为了面包屑把所有详情页塞进菜单，也不需要维护完整路由表。

## 面包屑高亮但点击没有返回上级？

非末级面包屑可点击需要满足其中之一：

- 该项来自菜单，并且菜单有可打开的 `viewUrl` / `url` / `uri`。
- 该项来自 `views.meta`，并且配置了 `viewUrl`。

只有 `title`、没有 `viewUrl` 的分组节点只会展示，不会打开页面。

## 相对链接应该如何创建？

使用 `TabViewUrl.createRelative("/micro-app/index.html")` 创建相对 iframe 地址。

不要直接传普通相对路径字符串。普通字符串会被当成组件 key 解析，找不到组件时就会报“视图未注册”。

## 外部链接为什么没有在浏览器新标签页打开？

默认情况下，http/https 地址会作为内部 iframe tab 打开。如果希望直接使用浏览器新窗口，需要传 `_viewOutside: true`：

```ts
await tabsManager.openTab("https://example.com", {
  _viewOutside: true,
  _viewOutsideProps: {
    target: "_blank",
  },
});
```

## 为什么内置 DynamicTabsComponent 样式不完整？

请确认没有被业务全局样式覆盖。标签栏本身使用组件内置样式，并可通过 CSS 变量定制主题。

如果业务系统已有成熟标签栏，也可以不使用 `DynamicTabsComponent`，直接通过 `useTabsManager().tabs` 自行渲染。

## 页面切换时如何阻止离开？

在页面组件里注册：

```ts
onBeforeTabLeave(async () => {
  if (!canLeave) return false;
});
```

返回 `false`、抛错或 rejected Promise 都会阻止离开。

## 想在刷新后恢复标签页，用什么存储？

默认是 `sessionStorage`。若希望跨会话恢复，可自定义 `storageAdapter` 使用 `localStorage`。

```ts
import { StorageAdapter } from "@xsbcme/vue-tab-router";

createTabsManager({
  views: { modules },
  storage: {
    adapter: new StorageAdapter(localStorage),
  },
});
```

退出登录时建议调用 `tabsManager.clear()`，避免下个用户恢复到上个用户的 tab。

## 为什么同一个页面会多开？

默认复用规则优先看 `viewUrl + viewProps` 是否完全一致。同一路径但业务参数不同，会认为是不同 tab。

如果希望同一路径只保留一个，可以传 `_viewSingle: true`：

```ts
await tabsManager.openTab("/src/views/user/page-index.vue", {
  _viewSingle: true,
});
```

也可以在 `views.meta.props` 中统一配置。

## 为什么 iframe 无法访问 contentDocument？

跨域 iframe 受浏览器同源策略限制，宿主只能操作 iframe 元素本身，不能访问内部 `document`。

跨域通信应使用 `postMessage`，并在 `iframe.messageOrigins` 中配置可信来源。

## Demo 项目在哪里？

Demo 已迁移到当前仓库的 `packages/demo`，可以执行：

```sh
pnpm --filter @xsbcme/demo dev
```
