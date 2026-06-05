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

## 历史版本

更早版本记录可参考包内 `packages/vue-tab-router/CHANGELOG.md`。
