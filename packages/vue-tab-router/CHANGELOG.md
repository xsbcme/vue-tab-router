# @xsbcme/vue-tab-router

## 1.1.1-beta.0

### Patch Changes

- 修复异步组件页面首次打开时 loading 延迟显示，避免页面在组件加载前短暂空白。

## 1.1.0

### Minor Changes

- aaeb151: 整理 npm 包元数据并准备 1.1 beta 预发布版本线。
- 88bfbe5: 新增内置默认状态组件并补齐渲染配置：提供 `DefaultLoadingComponent`、`DefaultErrorComponent`、`DefaultEmptyComponent`、`DefaultNotFoundComponent`，支持通过 `render.loadingComponent`、`render.errorComponent`、`render.noActiveComponent`、`render.noExistComponent` 和 `iframe.loadingComponent` 覆盖。

  修复 iframe 打开 hash 链接后加载状态可能停留的问题。同文档 hash/history 导航现在会归一化触发 iframe load，避免加载态悬挂，同时保留 `onLoad` 和 `iframe:load` 事件传递。

  优化缓存组件标签页的滚动恢复：开启缓存的组件页在切换标签后会恢复外层内容区以及页面内部滚动容器的位置；未开启缓存的页面仍按新页面语义回到顶部。

  整理内置组件结构：默认状态组件改为 `default-state` 组件族聚合维护，单入口容器组件文件展开到 `components` 根层级，保持原有公开组件导出名称不变。

### Patch Changes

- 3b49072: 修复组件页内容超过容器高度时无法滚动查看完整内容的问题。组件页内容层现在允许滚动，iframe 页面仍保持外层裁剪，避免链接页面显示溢出。
- 772c993: 修复右键菜单“弹窗显示”中的关闭行为：弹窗内原页面调用关闭当前标签页时，会同步关闭主工作台中的来源标签和弹窗；弹窗内新打开的子标签关闭时仅影响弹窗内部标签，不会误关来源标签或弹窗。不可关闭标签仍会保持不可关闭，不会被弹窗内关闭操作绕过。
- 95e5adc: 修复 iframe 页面请求刷新或关闭当前标签页时的弹窗显示行为：iframe 位于右键菜单“弹窗显示”的原页面时，会正确刷新弹窗内 iframe，关闭时会同步关闭主工作台中的来源标签和弹窗；iframe 位于弹窗内新打开的子标签时，仅刷新或关闭弹窗内部子标签。同时修复通过 `createTabsManager()` 返回的根实例触发关闭、刷新等状态变更时，界面可能要等到下一次标签切换才同步更新的问题。
- 918860b: 修复 npm 可信发布和 GitHub Pages 文档的包元数据。

## 1.1.0-beta.4

### Minor Changes

- 新增内置默认状态组件并补齐渲染配置：提供 `DefaultLoadingComponent`、`DefaultErrorComponent`、`DefaultEmptyComponent`、`DefaultNotFoundComponent`，支持通过 `render.loadingComponent`、`render.errorComponent`、`render.noActiveComponent`、`render.noExistComponent` 和 `iframe.loadingComponent` 覆盖。
- 修复 iframe 打开 hash 链接后加载状态可能停留的问题。同文档 hash/history 导航现在会归一化触发 iframe load，避免加载态悬挂，同时保留 `onLoad` 和 `iframe:load` 事件传递。
- 优化缓存组件标签页的滚动恢复：开启缓存的组件页在切换标签后会恢复外层内容区以及页面内部滚动容器的位置；未开启缓存的页面仍按新页面语义回到顶部。
- 整理内置组件结构：默认状态组件改为 `default-state` 组件族聚合维护，单入口容器组件文件展开到 `components` 根层级，保持原有公开组件导出名称不变。

## 1.1.0-beta.3

### Patch Changes

- 修复组件页内容超过容器高度时无法滚动查看完整内容的问题。组件页内容层现在允许滚动，iframe 页面仍保持外层裁剪，避免链接页面显示溢出。

## 1.1.0-beta.2

### Patch Changes

- 修复 iframe 页面请求刷新或关闭当前标签页时的弹窗显示行为：iframe 位于右键菜单“弹窗显示”的原页面时，会正确刷新弹窗内 iframe，关闭时会同步关闭主工作台中的来源标签和弹窗；iframe 位于弹窗内新打开的子标签时，仅刷新或关闭弹窗内部子标签。同时修复通过 `createTabsManager()` 返回的根实例触发关闭、刷新等状态变更时，界面可能要等到下一次标签切换才同步更新的问题。

## 1.1.0-beta.1

### Patch Changes

- 修复右键菜单“弹窗显示”中的关闭行为：弹窗内原页面调用关闭当前标签页时，会同步关闭主工作台中的来源标签和弹窗；弹窗内新打开的子标签关闭时仅影响弹窗内部标签，不会误关来源标签或弹窗。不可关闭标签仍会保持不可关闭，不会被弹窗内关闭操作绕过。

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
