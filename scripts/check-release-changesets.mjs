import { readdir, readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const changesetDir = resolve(rootDir, ".changeset");
const allowedPackageNames = ["@xsbcme/vue-tab-router", "@xsbcme/vue-router-tab"];

const logStep = message => console.log(`\n[变更日志范围] ${message}`);

const parsePackages = content => {
  const normalizedContent = content.replace(/\r\n/g, "\n");
  const match = normalizedContent.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return [];

  return match[1]
    .split("\n")
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => {
      const packageMatch = line.match(/^['"]?([^'"]+)['"]?\s*:/);
      return packageMatch?.[1];
    })
    .filter(Boolean);
};

const files = (await readdir(changesetDir)).filter(file => file.endsWith(".md") && file !== "README.md");

logStep("检查待发布 changeset 是否只归属插件包。");
logStep(`允许写入发布日志的包：${allowedPackageNames.join(", ")}`);

const invalidEntries = [];

for (const file of files) {
  const filePath = resolve(changesetDir, file);
  const packages = parsePackages(await readFile(filePath, "utf8"));

  if (packages.length === 0) {
    invalidEntries.push(`${file}：没有找到 changeset frontmatter，请确认文件格式是否正确。`);
    continue;
  }

  const disallowedPackages = packages.filter(packageName => !allowedPackageNames.includes(packageName));
  if (disallowedPackages.length > 0) {
    invalidEntries.push(`${file}：包含非插件包 ${disallowedPackages.join(", ")}`);
  }
}

if (invalidEntries.length > 0) {
  console.error("\n[变更日志范围] 检查失败：发布日志只能写入插件包相关内容。");
  for (const entry of invalidEntries) {
    console.error(`[变更日志范围] ${entry}`);
  }
  console.error(
    `[变更日志范围] 请只在 changeset 中声明 ${allowedPackageNames.join(", ")}，docs/demo/构建流程等外层变更不要写入插件发布日志。`
  );
  process.exit(1);
}

if (files.length === 0) {
  logStep("当前没有待发布 changeset。若准备发版，请先执行 `pnpm release:change` 编写插件变更说明。");
} else {
  logStep(`检查通过：${files.length} 个 changeset 都只归属插件包。`);
}
