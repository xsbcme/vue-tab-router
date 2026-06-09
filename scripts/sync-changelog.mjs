import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sourcePath = resolve(rootDir, "packages/vue-tab-router/CHANGELOG.md");
const targetPath = resolve(rootDir, "packages/docs/views/log/index.md");
const startMarker = "<!-- VUE_TAB_ROUTER_CHANGELOG_START -->";
const endMarker = "<!-- VUE_TAB_ROUTER_CHANGELOG_END -->";

const checkOnly = process.argv.includes("--check");

const logStep = message => console.log(`\n[日志同步] ${message}`);

const normalizeContent = value => value.replace(/\r\n/g, "\n").trimEnd() + "\n";

const stripPackageHeading = changelog => changelog.replace(/^# .+\n+/, "").trim();

const createGeneratedSection = changelog => `${startMarker}
## 包内完整更新日志

以下内容从 \`packages/vue-tab-router/CHANGELOG.md\` 自动同步。发布前请先运行 \`pnpm changelog:sync\`。

${stripPackageHeading(changelog)}
${endMarker}`;

const replaceGeneratedSection = (target, generatedSection) => {
  const startIndex = target.indexOf(startMarker);
  const endIndex = target.indexOf(endMarker);

  if (startIndex >= 0 && endIndex >= 0 && endIndex > startIndex) {
    return `${target.slice(0, startIndex).trimEnd()}\n\n${generatedSection}\n${target.slice(endIndex + endMarker.length).trimStart()}`.trimEnd() + "\n";
  }

  const legacyHistoryPattern = /\n## 历史版本\n\n更早版本记录可参考包内 `packages\/vue-tab-router\/CHANGELOG\.md`。\s*$/;
  if (legacyHistoryPattern.test(target)) {
    return target.replace(legacyHistoryPattern, `\n\n${generatedSection}\n`);
  }

  return `${target.trimEnd()}\n\n${generatedSection}\n`;
};

const sourceChangelog = normalizeContent(await readFile(sourcePath, "utf8"));
const targetChangelog = normalizeContent(await readFile(targetPath, "utf8"));
const nextTargetChangelog = replaceGeneratedSection(targetChangelog, createGeneratedSection(sourceChangelog));

if (checkOnly) {
  logStep("检查包内更新日志是否已经同步到文档站日志页。该步骤不会修改文件。");

  if (targetChangelog !== normalizeContent(nextTargetChangelog)) {
    console.error("\n[日志同步] 文档日志未同步，已停止发布流程。");
    console.error("[日志同步] 请先执行 `pnpm changelog:sync`，确认 `packages/docs/views/log/index.md` 的变化后一起提交。");
    process.exit(1);
  }

  logStep("检查通过：文档日志已经是最新的。");
  process.exit(0);
}

logStep("开始同步更新日志。");
logStep("来源：packages/vue-tab-router/CHANGELOG.md");
logStep("目标：packages/docs/views/log/index.md");
await writeFile(targetPath, nextTargetChangelog);
logStep("同步完成：请检查并提交文档日志页的变化。");