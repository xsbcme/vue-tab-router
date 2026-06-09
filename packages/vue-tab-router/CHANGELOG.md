# @xsbcme/vue-tab-router

## 1.1.0-beta.0

### Minor Changes

- 整理 npm 包元数据并准备 1.1 beta 预发布版本线。

## 1.0.0-beta.39

### Patch Changes

- 修复 npm 可信发布和 GitHub Pages 文档的包元数据。

## 1.0.0-beta.38

### Major Changes

- 统一页面打开入口，推荐全部通过 `openTab(viewUrl, options)` 打开组件页、iframe 页、外链页和相对链接页。
- 新增 `TabViewUrl` 命名空间，用 `TabViewUrl.createRelative()` 创建相对 iframe 地址，避免暴露内部 magic string。
- 重构初始化配置为分组结构，新增 `views`、`render`、`storage`、`iframe`、`guards`、`detached` 等配置域。
- 支持非单例 `TabsManager` 和 scoped manager，预览容器、弹窗容器可以拥有独立 tabs、事件中心和 iframe 状态。

### Minor Changes

- 新增 `views.meta` 页面元数据配置，可集中声明页面标题、图标、默认 `openTab` 参数、业务元信息和层级关系。
- 新增 `DynamicBreadcrumbComponent`，支持基于 `views.meta`、菜单树和注册路径生成面包屑；来自 `views.meta` 或菜单的父级项可点击打开。
- 新增 `createTabUrlSyncPlugin`，支持将当前激活 tab 同步到 Vue Router query，并支持浏览器前进、后退、刷新恢复。
- URL 同步插件新增 `queryKey`、`syncInitialActiveTab`、`syncDocumentTitle` 和 `formatDocumentTitle` 配置。
- 支持登录后进入工作台时补齐初始 active tab query，适配先打开首页再跳转 dashboard 的后台登录流程。
- 内置标签栏支持右键菜单、拖拽排序、置顶、禁止拖拽、不可关闭首页和弹窗显示。
- detached 弹窗显示支持 `fullscreen`、`zIndex` 等配置，并复用 scoped manager 隔离临时标签组。
- `useTabMenu` 新增 `breadcrumbs`，菜单 key 生成默认忽略 `_viewName`、`_viewIcon` 等展示字段，减少同页不同标题导致的误匹配。

### Patch Changes

- 优化 `openTab` 与 `views.meta` 的合并规则：meta 默认值优先，显式 `openTab` 参数最终覆盖。
- 增强 iframe 消息通信和当前 iframe 消息发送能力，补齐 `postCurrentIframeMessage` 等便捷 API。
- 补充 base64url URL 状态编解码、非法 query 清理、文档标题同步、面包屑点击、pin/no-drag、view meta 默认值等测试覆盖。
- 完善 Demo 接入，示例覆盖 `views.meta`、URL 同步、文档标题同步、面包屑、插件 hooks、守卫、iframe 通信和项目实践场景。

