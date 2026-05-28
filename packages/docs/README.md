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

## 目录结构

```txt
packages/docs
├─.vitepress/config.ts      # VitePress 配置、导航和侧边栏
├─images/                   # 文档静态图片
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
- Demo 相关说明应指向 workspace 内的 `packages/demo`。
- 文档包是 private 包，已在 changeset 配置中忽略，不参与插件发版。

## 更新日志

`CHANGELOG.md` 仅用于记录文档站自身变更。插件发布历史请维护 `packages/vue-tab-router/CHANGELOG.md`。
