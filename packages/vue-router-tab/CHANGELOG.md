# @xsbcme/vue-router-tab

## 1.2.0

### Minor Changes

- 8391ef4: 新增 Vue Router 标签页适配器第一阶段基础支持。`@xsbcme/vue-router-tab` 作为独立适配包连接 Vue Router 与核心 `TabsManager`，支持通过 `route.meta.tab` 声明标签页标题、图标、缓存、关闭、固定、单例和匹配策略，并初步实现路由切换、标签切换、关闭标签和刷新恢复之间的同步流程。

  修复刷新后已恢复的路由标签页视图丢失问题：适配器会在初始化时重新注册已持久化的路由视图包装组件，避免切换标签后动态 RouteView 丢失。适配器元信息约定同步收紧，标题和图标统一放入 `meta.tab`，不再从 Vue Router 顶层 `meta.title`、`meta.icon` 或自定义 `props` 入口混合读取。

  新增 `examples/vue-router-tab` 示例项目，用于验证登录页、工作台布局、移动端显示、动态路由、路由守卫和标签页同步等场景。该示例目前用于第一阶段能力验证，Vue Router 适配器尚未作为完整稳定能力对外承诺，后续仍需继续完善真实业务路由、守卫、缓存、动态参数和边界场景。

  调整核心包的可选能力导出边界：`iframe client` 迁移到 `@xsbcme/vue-tab-router/iframe/client`，URL 同步插件迁移到 `@xsbcme/vue-tab-router/plugins/tab-url-sync`，避免主入口引入 iframe client 或 URL 同步插件实现。浏览器全局包 `dist/browser/iframe-client.global.js` 保持不变。

  重构仓库示例与文档结构，将核心示例、Vue Router 适配示例、文档站和媒体资源分层管理，并同步 README、指南、API 文档、变更日志与示例说明。

### Patch Changes

- Updated dependencies [3b6d344]
- Updated dependencies [7ed0e5f]
- Updated dependencies [8391ef4]
  - @xsbcme/vue-tab-router@1.2.0
