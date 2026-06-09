import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { spawn } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const preStatePath = resolve(rootDir, ".changeset/pre.json");
const target = process.argv[2];

if (target !== "beta" && target !== "latest") {
  console.error("用法错误：请执行 `pnpm release:beta` 或 `pnpm release:latest`。");
  console.error("beta 用于预发布版本，latest 用于正式版本。");
  process.exit(1);
}

const releaseName = target === "beta" ? "beta 预发布版本" : "latest 正式版本";

const logStep = message => console.log(`\n[准备发布] ${message}`);

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

const readPreState = async () => {
  if (!existsSync(preStatePath)) return undefined;
  return JSON.parse(await readFile(preStatePath, "utf8"));
};

const preState = await readPreState();

logStep(`开始准备 ${releaseName}。`);
logStep(`当前 changesets 预发布状态：${preState ? `${preState.mode} / ${preState.tag ?? "无 tag"}` : "未启用"}。`);

logStep("检查待发布 changeset 是否只包含插件包日志。");
await run(["changeset:check"]);

if (target === "beta") {
  if (preState?.mode === "pre" && preState.tag === "beta") {
    logStep("当前已经处于 beta 预发布通道，无需重复进入。");
  } else {
    logStep("进入 beta 预发布通道，后续版本号会生成类似 1.0.0-beta.x。");
    await run(["changeset", "pre", "enter", "beta"]);
  }
}

if (target === "latest") {
  if (preState?.mode === "pre") {
    logStep("退出预发布通道，准备生成正式版本号。");
    await run(["changeset", "pre", "exit"]);
  } else {
    logStep("当前已经是正式发布模式，无需退出预发布通道。");
  }
}

logStep("根据 changeset 生成版本号和包内 CHANGELOG。");
await run(["changeset", "version"]);

logStep("同步包内 CHANGELOG 到文档站日志页。");
await run(["changelog:sync"]);

logStep("检查文档日志同步结果。");
await run(["changelog:check"]);

logStep(`准备完成：${releaseName} 的版本文件和文档日志已经生成。`);
logStep("下一步：检查 git diff，提交并推送，然后到 GitHub Actions 手动运行 `Release NPM`。");