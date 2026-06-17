# Vue Router Tab Demo

这是 `@xsbcme/vue-router-tab` 的独立演示项目，用来验证 route-first 的使用方式。

实际项目只需要显式安装适配包和 Vue Router；底层 `@xsbcme/vue-tab-router` 由适配包作为依赖带入。

```bash
pnpm add @xsbcme/vue-router-tab vue-router
```

```bash
pnpm dev:router-tab-demo
pnpm build:router-tab-demo
```

## 结构说明

```txt
src/
├── layouts/
│   ├── login/       # 登录页，由 Vue Router 直接渲染，不进入标签页
│   └── container/   # 工作台布局，承载菜单、标签栏、面包屑和标签容器
├── plugins/
│   ├── tab-router/  # createVueRouterTabsPlugin 接入示例
│   └── vue-router/  # Vue Router 实例、路由表和 route meta 示例
└── views/           # 被 Vue Router 路由记录引用的业务页面
```

`examples/vue-tab-router` 继续测试底层 `@xsbcme/vue-tab-router` 的 viewUrl-first 能力；本项目只测试 Vue Router 适配层。登录页和工作台页由 Vue Router 管理，工作台内部的业务路由由适配层同步为标签页。
