# 与 VueRouter 结合使用

## 推荐分层

- 顶层使用 `VueRouter`：登录、工作台、错误页等主路由
- 工作台内部使用 `VueTabRouter`：管理业务标签页

这样职责清晰，URL 体系和多标签行为互不冲突。

## 示例结构

```txt
src
├─router/index.ts        # VueRouter
├─layouts/workbench.vue  # 放 DynamicTabsComponent / DynamicContainerComponent
└─views/**/page-index.vue
```

## 一个简单流程

1. 路由进入 `/workbench`
2. `workbench` 布局挂载 `DynamicContainerComponent`
3. 菜单点击时调用 `tabsManager.openTab(viewUrl, options)`

```ts
// menu click
tabsManager.openTab("/src/views/order/page-index.vue", {
  _viewName: "订单列表",
});
```

## 登录场景

常见后台应用会在登录成功后打开首页 tab，再进入工作台路由：

```ts
async function login() {
  await tabsManager.openFirstTab("/src/views/home/page-index.vue", {
    _viewName: "首页",
  });

  router.replace("/dashboard");
}
```

如果同时使用 `createTabUrlSyncPlugin`，建议配置 `routePath` 限定只在工作台路由同步：

```ts
createTabUrlSyncPlugin(router, {
  routePath: "/dashboard",
  queryKey: "activeTab",
});
```

这样登录页不会携带 tab 状态，进入工作台后会自动补齐当前激活 tab。

## 路由守卫

Vue Router 仍然负责登录鉴权和顶层页面访问控制：

```ts
router.beforeEach((to, _from, next) => {
  if (to.meta?.accessAuth && !userStore.getToken) {
    return next({ path: "/login", query: { redirect: to.fullPath } });
  }

  next();
});
```

`VueTabRouter` 的守卫只负责 tab 内部行为，例如打开、切换、关闭某个业务页面。

## 常见约束建议

- 菜单与 `modules` key 保持一致，避免“视图未注册”
- 顶层路由切换离开工作台时，可按需调用 `tabsManager.clear()`
- 业务详情页建议携带稳定业务主键到 `viewProps`

## 不建议的做法

- 把 `VueTabRouter` 当作整个站点主路由替代方案
- `viewUrl` 使用和 `modules` 无关的自定义字符串
- 为了面包屑把所有详情页都配置成 Vue Router 子路由

## 推荐阅读

- [地址栏同步与浏览器历史](/views/guide/url-sync)
- [页面模块与元数据](/views/guide/view-meta)
- [菜单联动](/views/guide/menu-integration)
