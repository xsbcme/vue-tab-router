# @xsbcme/docs

## 0.0.2

### Major Changes

- 重写 API 文档结构，将总览拆分为 TabsManager、组合式 API、内置组件、插件与 hooks、类型与工具等独立页面。
- 新增页面模块与元数据指南，系统说明 `views.modules`、`views.meta`、默认打开参数、详情页层级和菜单解耦方式。
- 新增面包屑指南，说明 `DynamicBreadcrumbComponent`、`useTabMenu().breadcrumbs`、点击行为和层级推断优先级。

### Minor Changes

- 扩展地址栏同步指南，补充 `queryKey`、`syncInitialActiveTab`、登录后 URL 补齐、浏览器历史恢复和文档标题同步。
- 扩展 Demo 文档，加入推荐验证路径、URL 同步、标题同步、iframe 通信、守卫 hooks 和常见排障。
- 扩展 Vue Router 集成文档，明确顶层路由与工作台 tabs 的职责边界，并补充登录流程示例。
- 扩展 FAQ，覆盖视图未注册、activeTab query、`views.meta` 与菜单分工、面包屑点击、相对链接、外链、多开、存储恢复和 iframe 跨域问题。

### Patch Changes

- 更新导航侧边栏，补齐 API 细分页、页面元数据和面包屑入口。
- 精简菜单联动文档，把页面层级和面包屑内容迁移到独立指南，降低重复说明。
- 补充外链导航、首页与预览容器、页面元信息、快速开始等页面中的新增能力链接和注意事项。
