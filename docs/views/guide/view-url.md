# 页面入口与 viewUrl

这一页只解决一个入门问题：`openTab(viewUrl)` 里的 `viewUrl` 到底从哪里来。先掌握这个关系，再去看页面元数据、菜单和面包屑会顺很多。

## 最小模型

`VueTabRouter` 打开组件页面时，会先到 `views.modules` 里查找页面入口：

```ts
const modules = import.meta.glob("@/views/**/page-index.vue");

const tabsManager = createTabsManager({
  views: {
    modules,
  },
});
```

`modules` 是一张页面注册表。注册表的 key 就是组件页面的 `viewUrl`。

```ts
await tabsManager.openTab("/src/views/user/page-index.vue");
```

如果不确定应该写什么，开发时打印一次：

```ts
console.log(Object.keys(modules));
```

从打印结果里复制对应页面的 key，传给 `openTab` 即可。

## 为什么推荐 page-index.vue

推荐用 `page-index.vue` 作为页面入口，是为了区分“能被工作台打开的页面”和“页面内部组件”。

```txt
src/views/order-center
├─page-index.vue        # 页面入口，会被注册成 tab 页面
├─order-filter.vue      # 页面内部组件，不会被注册
├─order-table.vue       # 页面内部组件
└─order-detail
  ├─page-index.vue      # 详情页入口，也可以独立打开
  └─detail-panel.vue    # 详情页内部组件
```

你也可以使用团队已有约定，例如 `@/pages/**/index.vue`。关键不是文件名必须相同，而是要有一套稳定的页面入口扫描规则。

## viewUrl 不是浏览器地址

组件页面的 `viewUrl` 是 `views.modules` 的 key，不是浏览器地址栏里的 URL。

```ts
await tabsManager.openTab("/src/views/order-center/page-index.vue", {
  _viewName: "订单中心",
});
```

这段代码的含义是：从注册表中找到 `/src/views/order-center/page-index.vue` 对应的组件，把它作为一个 tab 打开。

如果 `viewUrl` 是 `http`、`https` 或 `TabViewUrl.createRelative()` 创建的相对地址，才会走 iframe/link 页面逻辑。组件页面和链接页面可以共用 `openTab`，但它们的身份来源不同。

## 多模块时保持 key 稳定

简单项目可以直接使用 `import.meta.glob` 生成的路径 key。多业务模块、依赖包页面或微前端项目，建议在聚合 `modules` 时把 key 规范化成稳定前缀。

```ts
function normalizeViewKeys(modules: Record<string, unknown>, moduleName: string, baseDir: string) {
  return Object.fromEntries(
    Object.entries(modules).map(([key, value]) => [`@${moduleName}/${key.replace(baseDir, "")}`, value])
  );
}

const salesViews = import.meta.glob("./modules/sales/views/**/page-index.vue");
const crmViews = import.meta.glob("./modules/crm/views/**/page-index.vue");

const modules = {
  ...normalizeViewKeys(salesViews, "sales", "./modules/sales/"),
  ...normalizeViewKeys(crmViews, "crm", "./modules/crm/"),
};
```

之后菜单、`views.meta` 和 `openTab()` 都使用同一套 key：

```ts
await tabsManager.openTab("@sales/views/order/page-index.vue");
```

## 什么时候继续看 views.meta

只打开页面时，`views.modules` 就够了。需要下面这些能力时，再配置 `views.meta`：

- 页面默认标题和图标不想每次 `openTab` 都传。
- 某些页面默认单例、禁用缓存或置顶。
- 详情页不在菜单里，但需要出现在面包屑层级中。
- 希望菜单只负责入口，页面说明集中维护。

下一步可以阅读 [基础页面导航](/views/guide/basic-navigation)。如果你已经要配置默认标题、图标和层级，继续看 [页面元数据与层级](/views/guide/view-meta)。
