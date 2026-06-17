# @xsbcme/docs

`@xsbcme/docs` 是 `@xsbcme/vue-tab-router` 的 VitePress 文档站点，负责维护插件指南、API 参考、Demo 说明和更新日志。

## 开发

在仓库根目录运行：

```bash
pnpm --filter @xsbcme/docs dev
```

也可以使用根命令启动所有开发任务：

```bash
pnpm dev
```

## 构建与预览

```bash
pnpm --filter @xsbcme/docs build
pnpm --filter @xsbcme/docs preview
```

构建产物位于 `.vitepress/dist`，VitePress 缓存位于 `.vitepress/cache` 和 `.vitepress/.temp`。这些目录属于本地产物，不应提交。

## 部署方式

仓库默认通过根目录脚本合并构建 GitHub Pages：文档站输出到 `/doc/`，核心 Demo 输出到 `/demo/`，Vue Router 适配 Demo 输出到 `/router-tab-demo/`。

```bash
pnpm build:pages -- --base /vue-tab-router/
```

只构建文档站时，如果部署到独立域名根路径，不需要配置 `VITEPRESS_BASE`，默认 `/` 即可。需要从文档站跳转到独立 Demo 站点时，通过环境变量注入在线 Demo 地址，避免换域名时改源码：

PowerShell：

```powershell
$env:DOCS_DEMO_URL = "https://demo.vtr.xsbcme.cn"; pnpm --filter @xsbcme/docs build
```

Linux / 宝塔终端：

```bash
DOCS_DEMO_URL=https://demo.vtr.xsbcme.cn pnpm --filter @xsbcme/docs build
```

如果未来文档站部署到子路径，再设置 `VITEPRESS_BASE`：

PowerShell：

```powershell
$env:VITEPRESS_BASE = "/vue-tab-router/"; $env:DOCS_DEMO_URL = "https://demo.vtr.xsbcme.cn"; pnpm --filter @xsbcme/docs build
```

Linux / 宝塔终端：

```bash
VITEPRESS_BASE=/vue-tab-router/ DOCS_DEMO_URL=https://demo.vtr.xsbcme.cn pnpm --filter @xsbcme/docs build
```

核心 Demo 站点独立部署时执行：

```bash
pnpm --filter @xsbcme/demo build
```

Vue Router 适配 Demo 站点独立部署时执行：

```bash
pnpm --filter @xsbcme/demo-router-tab build
```

## 目录结构

```txt
docs
├─.vitepress/config.ts      # VitePress 配置、导航和侧边栏
├─public/                   # 文档静态资源
│  └─images/                # 文档图片
├─views/
│  ├─api/                   # API 参考
│  ├─demo/                  # 本地 demo 说明
│  ├─guide/                 # 使用指南
│  └─log/                   # 更新日志页面
├─index.md                  # 文档首页
└─package.json
```

## 维护约定

- 新增页面后，同步更新 `.vitepress/config.ts` 中的 `nav` 或 `sidebar`。
- 文档示例应以 `packages/vue-tab-router/src` 当前导出的 API 为准。
- 示例相关说明应指向 workspace 内的 `examples/vue-tab-router` 或 `examples/vue-router-tab`。
- 文档包是 private 包，已在 changeset 配置中忽略，不参与插件发版。

## 更新日志

插件发布历史以 `packages/vue-tab-router/CHANGELOG.md` 为准，并通过 `pnpm changelog:sync` 同步到 `views/log/index.md`。
