# VueTabRouter 是什么？

`VueTabRouter` 是一个面向 `Vue 3` 的多标签页路由管理插件，适用于后台管理系统、工作台、多文档编辑器等场景。

它并不是要替代 `VueRouter`，而是解决“在某个业务壳层里，如何像浏览器一样管理多个业务页面”的问题。

## 核心能力

- 组件页面与链接页面（`iframe`）统一管理
- 同一路径单例复用 / 多开并存
- 标签页缓存与刷新控制（keep-alive）
- 页面级守卫与全局守卫
- 子页签向来源页签通信
- 持久化存储（默认 `sessionStorage`，可自定义）
- 插件扩展机制（`addPlugin`）

## 与 VueRouter 的关系

- **VueRouter**：负责站点级 URL 路由和页面切换
- **VueTabRouter**：负责某个容器区域内的多标签页状态和行为

两者可以组合使用：例如顶层路由控制“登录页/工作台”，进入工作台后由 `VueTabRouter` 管理内部多页面标签。

> [!TIP]
> 推荐先阅读 [快速开始](/views/guide/getting-started) 和 [基础页面导航](/views/guide/basic-navigation)，再进入进阶能力。