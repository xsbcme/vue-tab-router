import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const preStatePath = resolve(rootDir, ".changeset/pre.json");
const packageJsonPath = resolve(rootDir, "packages/vue-tab-router/package.json");
const tag = process.argv[2];

if (tag !== "beta" && tag !== "latest") {
  console.error("用法错误：请执行 `pnpm release:publish beta` 或 `pnpm release:publish latest`。");
  console.error("该命令会真实发布 npm 包，通常只应由 GitHub Actions 调用。");
  process.exit(1);
}

const releaseName = tag === "beta" ? "beta 预发布版本" : "latest 正式版本";

const logStep = message => console.log(`\n[发布 npm] ${message}`);

const readJson = async path => JSON.parse(await readFile(path, "utf8"));

const readPreState = async () => {
  if (!existsSync(preStatePath)) return undefined;
  return readJson(preStatePath);
};

const run = args => {
  const command = "pnpm";
  const commandText = `${command} ${args.join(" ")}`;

  logStep(`执行命令：${commandText}`);

  return new Promise((resolveRun, reject) => {
    const child = spawn(command, args, {
      cwd: rootDir,
      shell: process.platform === "win32",
      stdio: "inherit",
    });

    child.on("error", reject);
    child.on("close", code => {
      if (code === 0) {
        resolveRun();
        return;
      }

      reject(new Error(`命令执行失败：${commandText}，退出码：${code}`));
    });
  });
};

logStep(`开始发布 ${releaseName}。`);

const preState = await readPreState();
const packageJson = await readJson(packageJsonPath);
const version = packageJson.version;
const isPrereleaseVersion = version.includes("-");

logStep(`当前插件版本：${version}`);
logStep(`当前 changesets 预发布状态：${preState ? `${preState.mode} / ${preState.tag ?? "无 tag"}` : "未启用"}。`);

if (tag === "beta" && (!preState || preState.mode !== "pre" || preState.tag !== "beta" || !isPrereleaseVersion)) {
  console.error("\n[发布 npm] 发布 beta 失败：当前不处于 changesets beta 预发布状态，或版本号不是预发布版本。");
  console.error("[发布 npm] 请先执行 `pnpm release:beta`，提交生成的版本文件后再发布 beta。");
  process.exit(1);
}

if (tag === "latest" && (preState?.mode === "pre" || isPrereleaseVersion)) {
  console.error("\n[发布 npm] 发布 latest 失败：当前仍处于预发布状态，或版本号仍带有 beta/rc 等预发布标记。");
  console.error("[发布 npm] 请先执行 `pnpm release:latest`，提交生成的正式版本文件后再发布 latest。");
  process.exit(1);
}

logStep("检查待发布 changeset 是否只包含插件包日志。");
await run(["changeset:check"]);

logStep("先检查文档日志是否已同步，避免包已发布但文档日志遗漏。");
await run(["changelog:check"]);

logStep("开始构建所有包，确保发布产物是最新的。");
await run(["build"]);

logStep("预览 npm 包内容，不会真正发布。请在日志中确认 dist 文件和类型声明存在。");
await run(["--filter", "@xsbcme/vue-tab-router", "exec", "npm", "pack", "--dry-run"]);

if (tag === "beta") {
  logStep("开始发布到 npm。当前处于 changesets beta 预发布模式，dist-tag 会由 pre.json 自动使用 beta。");
  await run(["changeset", "publish"]);
} else {
  logStep("开始发布到 npm，dist-tag 为 latest。");
  await run(["changeset", "publish", "--tag", "latest"]);
}

logStep(`发布完成：${releaseName} 已提交给 npm。`);