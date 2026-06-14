# VueTabRouter 是什么？

`VueTabRouter` 是一个面向 `Vue 3` 的多标签页路由管理插件，适用于后台管理系统、工作台、多文档编辑器等场景。

它并不是要替代 `VueRouter`，而是解决“在某个业务壳层里，如何像浏览器一样管理多个业务页面”的问题。

如果你是第一次接入，先把它理解成一个工作台运行时：页面通过 `openTab` 打开，标签栏显示已经打开的页面，内容容器负责渲染当前激活页。菜单、缓存、守卫、iframe 和插件扩展都可以等最小工作台跑通后再加入。

## 学习路径

| 顺序 | 先做什么                 | 阅读                                                 |
| ---- | ------------------------ | ---------------------------------------------------- |
| 1    | 了解目录和命名约定       | [入门约定](/views/guide/introduction)                |
| 2    | 跑通一个最小工作台       | [快速开始](/views/guide/getting-started)             |
| 3    | 理解页面入口和 `viewUrl` | [页面入口与 viewUrl](/views/guide/view-url)          |
| 4    | 学会打开、切换、关闭页面 | [基础页面导航](/views/guide/basic-navigation)        |
| 5    | 接入菜单、面包屑和缓存   | [菜单联动](/views/guide/menu-integration)            |
| 6    | 再处理守卫、iframe、插件 | [页面事件通信与守卫](/views/guide/events-and-guards) |

## 核心能力

- 组件页面与链接页面（`iframe`）统一管理
- 同一路径单例复用 / 多开并存
- 标签页缓存与刷新控制（keep-alive）
- 页面级守卫与全局守卫
- 子页签向来源页签通信
- 持久化存储（默认 `sessionStorage`，可自定义）
- 插件扩展机制（`plugins` + 生命周期 hooks）

## 与 VueRouter 的关系

- **VueRouter**：负责站点级 URL 路由和页面切换
- **VueTabRouter**：负责某个容器区域内的多标签页状态和行为

两者可以组合使用：例如顶层路由控制“登录页/工作台”，进入工作台后由 `VueTabRouter` 管理内部多页面标签。

> [!TIP]
> 读文档时可以先跳过高级能力。只要你已经能创建 `TabsManager`、放置两个内置容器、调用 `openTab`，后面的能力都能渐进接入。
