---
"@xsbcme/vue-tab-router": minor
---

新增内置默认状态组件并补齐渲染配置：提供 `DefaultLoadingComponent`、`DefaultErrorComponent`、`DefaultEmptyComponent`、`DefaultNotFoundComponent`，支持通过 `render.loadingComponent`、`render.errorComponent`、`render.noActiveComponent`、`render.noExistComponent` 和 `iframe.loadingComponent` 覆盖。

修复 iframe 打开 hash 链接后加载状态可能停留的问题。同文档 hash/history 导航现在会归一化触发 iframe load，避免加载态悬挂，同时保留 `onLoad` 和 `iframe:load` 事件传递。

优化缓存组件标签页的滚动恢复：开启缓存的组件页在切换标签后会恢复外层内容区以及页面内部滚动容器的位置；未开启缓存的页面仍按新页面语义回到顶部。

整理内置组件结构：默认状态组件改为 `default-state` 组件族聚合维护，单入口容器组件文件展开到 `components` 根层级，保持原有公开组件导出名称不变。
