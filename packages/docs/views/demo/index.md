# 本地演示项目

当前仓库已内置演示项目：`packages/demo`。它用于展示插件在后台工作台中的完整接入方式，并按“从简单到复杂”的顺序拆成多组小演示。

## 启动

```sh
pnpm install
pnpm dev:demo
```

也可以只针对 demo 包运行：

```sh
pnpm --filter @xsbcme/demo dev
```

启动后进入登录页，任意填写账号、密码、验证码即可登录。Demo 会打开首页 tab 并跳转到工作台。

如果启用了地址栏同步插件，登录后 URL 会带上当前激活 tab 状态，例如：

```txt
/#/dashboard?activeTab=...
```

## 构建

```sh
pnpm build:demo
```

## 渐进式菜单结构

Demo 左侧菜单现在按学习顺序组织。建议从上往下点击，每个入口只聚焦一组能力。

| 菜单入口      | Demo 位置                            | 覆盖能力                                 |
| ------------- | ------------------------------------ | ---------------------------------------- |
| 最小入门      | `src/views/learning/start`           | 最小 `openTab` 闭环、`viewUrl`、目标页   |
| 基础操作      | `src/views/learning/basic-open`      | 单例复用、多开、刷新、更新、关闭、缓存   |
| 菜单与层级    | `src/views/learning/menu-breadcrumb` | 菜单入口、详情页层级、面包屑             |
| 通信与守卫    | `src/views/learning/events`          | 父子通信、进入守卫、离开守卫、关闭守卫   |
| 链接与 Iframe | `src/views/learning/iframe-links`    | 链接打开、iframe 缓存、消息、导航同步    |
| 弹窗与预览    | `src/views/learning/detached`        | 弹窗显示、预览容器、独立标签组           |
| 扩展与外观    | `src/views/learning/plugin-hooks`    | 插件 hooks、主题变量、动态图标、状态组件 |
| 项目实践      | `src/views/practice/overview`        | 业务场景组合、列表详情、报表、客户工作台 |
| API 覆盖检查  | `src/views/learning/api-check`       | 维护者检查清单、状态组件入口             |

## 建议验证路径

### 1. 最小打开页面

进入“最小入门 / 最小打开页面”：

1. 点击“打开目标页”。
2. 观察标签栏出现目标页。
3. 在页面中查看示例 `viewUrl`。

### 2. 基础操作

进入“基础操作”：

1. 在“打开与复用”中比较单例和多开。
2. 在“当前页操作”中验证刷新、更新标题、关闭当前页。
3. 在“缓存对照”中切换缓存页和不缓存页。
4. 在“批量与排序”中验证首页、置顶、禁拖和批量关闭。

### 3. 菜单、层级和面包屑

进入“菜单与层级”：

1. 打开订单处理中心。
2. 再打开订单详情。
3. 观察面包屑和父路径推导。
4. 详情页不需要出现在左侧菜单中，层级来自 `views.meta`。

### 4. 通信、守卫和 hooks

进入“通信与守卫”：

1. 在“父子通信”中打开通信子页并发送事件。
2. 在“页面守卫”中分别验证进入、离开和关闭守卫。
3. 在“插件 Hooks”中观察全局守卫日志和插件 hook 日志。

### 5. Iframe 能力

进入“链接与 Iframe”：

1. 先看链接打开方式，理解内部 iframe 与外部新窗口。
2. 再看 iframe 缓存，比较切换后的状态保留。
3. 再看 iframe 消息，验证宿主和 iframe 双向通信。
4. 最后看 iframe 导航同步和地址栏恢复。

### 6. 高级能力与综合实践

进入“弹窗与预览”“扩展与外观”“项目实践”：

1. 验证弹窗显示和预览容器。
2. 验证插件 hooks、主题、图标和状态组件。
3. 进入项目实践页，从完整业务场景回看前面的能力组合。

## 项目结构

```txt
packages/demo
├─src
│  ├─plugins
│  │  ├─tab-router      # createTabsManager 配置
│  │  ├─vue-router      # 顶层路由与登录鉴权
│  │  └─store           # Pinia 状态
│  ├─layouts/container  # 工作台布局、菜单、标签栏、内容区
│  └─views
│     ├─learning        # 渐进式演示页
│     ├─practice        # 综合业务实践
│     └─test-*          # 渐进式页面调用的目标页
├─vite.config.ts
└─package.json
```

Demo 依赖工作区内的 `@xsbcme/vue-tab-router`，因此修改插件源码后重新构建即可在 demo 中验证。
