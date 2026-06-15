---
"@xsbcme/vue-tab-router": major
---

新增内置标签栏虚拟渲染能力，适配大量标签页且标签宽度不固定的场景。`DynamicTabsComponent` 现在会在标签数量达到阈值后自动启用横向虚拟列表，并通过真实宽度测量、可视范围计算和 overscan 渲染减少 DOM 数量，降低大量标签页下的渲染、滚动和拖拽卡顿。

拆分内置标签栏实现，将滚动控制、拖拽排序、右键菜单和虚拟列表逻辑拆分到独立组件与组合函数中，降低 `DynamicTabsComponent` 的复杂度，便于后续维护和性能优化。

调整内置标签栏配置结构，标签栏相关配置统一收口到 `render.tabs` 下：`render.tabs.titleMaxLength`、`render.tabs.draggable`、`render.tabs.showIcon` 和 `render.tabs.virtual`。旧的 `render.viewNameMaxLength`、`render.draggable`、`render.showIcon` 不再保留兼容。

调整新窗口打开配置，移除 `_viewOutsideProps`，现在可直接通过 `_viewOutside: { target, features }` 传递 `window.open` 配置；仅需默认新窗口打开时仍可使用 `_viewOutside: true`。

完善文档和示例，补充虚拟标签栏、标签栏配置、外部打开配置和主题使用说明；主题示例和主题指南从运行时源码目录迁移到文档项目，源码包仅保留实际运行时主题 API 与样式文件。