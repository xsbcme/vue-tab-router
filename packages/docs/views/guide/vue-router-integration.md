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
tabsManager.openTab('/src/views/order/page-index.vue', {
  _viewName: '订单列表'
});
```

## 常见约束建议

- 菜单与 `modules` key 保持一致，避免“视图未注册”
- 顶层路由切换离开工作台时，可按需调用 `tabsManager.clear()`
- 业务详情页建议携带稳定业务主键到 `viewProps`

## 不建议的做法

- 把 `VueTabRouter` 当作整个站点主路由替代方案
- `viewUrl` 使用和 `modules` 无关的自定义字符串
