# 更新日志

本文记录 `@xsbcme/vue-tab-router` 的重要变更，重点说明行为变化、升级影响和 Demo/文档覆盖情况。

## 1.0.0-beta.37 - 2026-06-05

### 重要变更

- 重构插件扩展体系，移除旧的继承式插件基类，改为轻量 hook 插件方案。
- `createTabsManager({ plugins })` 支持函数插件和对象插件，插件可监听标签生命周期、清理副作用，并处理 iframe 消息。
- `onIframeReady`、`iframeClass`、`iframeStyle`、`iframeInjectStyle` 已移除。
- iframe 加载后统一使用 `onIframeLoad({ event, iframe, tab })` 处理 DOM 样式、同源样式注入和加载日志。
- iframe 缓存机制独立于 Vue `KeepAlive`，通过持久 iframe DOM 层保留页面状态；`_viewNoCache` 可显式禁用 iframe 缓存。

### 新增能力

- 新增 `useTabMenu`，用于菜单和标签页联动，提供 `selectedKeys`、`getMenuKey`、`getTabKey`、`handleMenuItemClick` 等能力。
- 新增菜单 key 归一化工具：`createTabMenuKey`、`getTabMenuKey`、`normalizeTabMenuProps`。
- 新增 iframe 通信能力：
  - `tabsManager.postIframeMessage(tabId, data, options?)`
  - `tabsManager.postActiveIframeMessage(data, options?)`
  - `postCurrentIframeMessage(data, options?)`
  - `onIframeMessage(message)`
  - 插件 hook：`iframe:message`
- 新增主题工具和内置主题说明：`applyTheme`、`themeToCssVariables`、`defaultTheme`、`lightTheme`、`darkTheme`。
- `DynamicIconComponent` 支持 Vue 组件名、SVG 字符串、图片路径和 base64 图片。
- `DynamicTabsComponent` 优化横向溢出体验：隐藏滚动条、左右滚动按钮、边界禁用、激活标签自动滚动到可见区域。

### 修复

- 修复 iframe 启用缓存后内容仍被销毁的问题。
- 修复 iframe 不缓存场景缺少测试覆盖的问题，Demo 已加入缓存/不缓存对照。
- 修复菜单联动中内部链接和外部链接相同 URL 时串选的问题，默认 key 会保留 `_viewOutside` 和业务参数。
- 修复相同 `relative:./` 相对链接导致菜单重复激活的问题，推荐通过业务 `menuKey` 区分。
- 修复标签页图标无法显示的问题：字符串图标需要能在 Vue 组件查找链路中找到，Demo 已全局注册默认 `IconApps`。
- 修复 Demo dev 依赖工作区包时解析到不存在的 `dist/index.js` 的问题，Demo Vite 配置已在开发中解析到插件源码。

### Demo 调整

- Demo 菜单从“每个小功能一个入口”重构为“能力域聚合面板”：
  - API 覆盖检查
  - 导航与缓存
  - 通信与守卫
  - 链接与 Iframe
  - 插件与主题
  - 项目实践
- 原有散点页面保留为测试目标页，由聚合面板打开，用于验证缓存、守卫、来源链路、更新、关闭等行为。
- `链接与 Iframe` 面板覆盖内部链接、外部链接、相对链接、iframe 缓存、不缓存和三种 postMessage 发送方式。
- `通信与守卫` 面板覆盖父子 tab 通信、页面级进入/离开/关闭守卫、全局守卫日志和插件 hook 日志。

### 文档调整

- 新增菜单联动指南。
- 新增 iframe 通信与缓存指南。
- 新增插件扩展指南。
- 更新 API 总览，补齐当前源码导出的组件、组合式函数、插件、iframe、主题和菜单工具。
- 更新 Demo 文档，说明新的聚合测试工作台结构。
- 更新实现文档，说明组件缓存和 iframe 缓存的不同实现路径。

### 迁移提示

- 如果使用过旧插件基类，请迁移到 `plugins` hook 方案。
- 如果使用过 `onIframeReady`，请迁移到 `onIframeLoad({ event, iframe, tab })`。
- 如果使用过 `iframeClass`、`iframeStyle` 或 `iframeInjectStyle`，请在 `onIframeLoad` 中直接操作 iframe 元素或同源 iframe 文档。
- 如果菜单中存在相同 URL 的内部/外部链接，升级后默认 `useTabMenu` key 会正确区分 `_viewOutside`；相同 URL 的不同业务菜单仍建议传稳定业务参数。

<!-- VUE_TAB_ROUTER_CHANGELOG_START -->
## 包内完整更新日志

以下内容从 `packages/vue-tab-router/CHANGELOG.md` 自动同步。发布前请先运行 `pnpm changelog:sync`。

## 1.0.0-beta.38

### Major Changes

- ad76cce: Replace the custom KeepAlive implementation with Vue's built-in KeepAlive and tab-scoped wrapper components.
  Redesign tab guard types and close APIs. Tab guards can now cancel navigation and close operations by returning `false`; close APIs now accept explicit options instead of the previous boolean force parameter.

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

## 1.0.0-beta.37

### Major Changes

- chore

## 1.0.0-beta.36

### Major Changes

- chore

## 1.0.0-beta.35

### Major Changes

- chore
- Replace the custom KeepAlive implementation with Vue's built-in KeepAlive and tab-scoped wrapper components.
  Redesign tab guard types and close APIs. Tab guards can now cancel navigation and close operations by returning `false`; close APIs now accept explicit options instead of the previous boolean force parameter.
- chore

## 1.0.0-beta.34

### Major Changes

- chore

### Patch Changes

- chore

## 1.0.0-beta.33

### Patch Changes

- chore

## 1.0.0-beta.32

### Patch Changes

- chore

## 1.0.0-beta.31

### Patch Changes

- chore

## 1.0.0-beta.30

### Patch Changes

- chore

## 1.0.0-beta.29

### Patch Changes

- chore
- chore

## 1.0.0-beta.28

### Patch Changes

- chore

## 1.0.0-beta.27

### Patch Changes

- chore

## 1.0.0-beta.26

### Patch Changes

- chore

## 1.0.28-beta.0

### Patch Changes

- chore

## 1.0.27

### Patch Changes

- chore

## 1.0.26

### Patch Changes

- chore

## 1.0.25

### Patch Changes

- chore
<!-- VUE_TAB_ROUTER_CHANGELOG_END -->
