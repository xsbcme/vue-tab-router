import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sourcePath = resolve(rootDir, "packages/vue-tab-router/CHANGELOG.md");
const targetPath = resolve(rootDir, "docs/views/log/index.md");
const startMarker = "<!-- VUE_TAB_ROUTER_CHANGELOG_START -->";
const endMarker = "<!-- VUE_TAB_ROUTER_CHANGELOG_END -->";

const checkOnly = process.argv.includes("--check");

const logStep = message => console.log(`\n[日志同步] ${message}`);

const normalizeContent = value => value.replace(/\r\n/g, "\n").trimEnd() + "\n";

const stripPackageHeading = changelog => changelog.replace(/^# .+\n+/, "").trim();

const sectionTitleMap = new Map([
  ["Major Changes", "重要变更"],
  ["Minor Changes", "新增能力"],
  ["Patch Changes", "修复与优化"],
]);

const internalChangePatterns = [
  /包元数据/,
  /预发布版本线/,
  /npm 可信发布/,
  /GitHub Pages 文档的包元数据/,
  /测试覆盖/,
  /Demo 接入/,
  /示例覆盖/,
];

const isInternalChange = line => internalChangePatterns.some(pattern => pattern.test(line));

const normalizeChangeForDocs = line => {
  const prereleaseVersionMatch = line.match(/^- 整理 npm 包元数据并准备 (.+) 预发布版本线。$/);
  if (prereleaseVersionMatch) return `- 开始 ${prereleaseVersionMatch[1]} 预发布版本线，为后续功能更新做准备。`;
  if (isInternalChange(line)) return "";
  return line;
};

const getSectionTitle = (section, items) => {
  if (items.every(item => /^- 开始 .+ 预发布版本线，/.test(item))) return "版本说明";
  return section.title;
};

const createVersionBlock = (versionTitle, sections) => {
  const sectionBlocks = sections
    .map(section => {
      const items = section.items.map(normalizeChangeForDocs).filter(Boolean);
      if (items.length === 0) return "";
      return [`### ${getSectionTitle(section, items)}`, "", ...items].join("\n");
    })
    .filter(Boolean);

  if (sectionBlocks.length === 0) return "";
  return [`## ${versionTitle}`, ...sectionBlocks].join("\n\n");
};

const formatForDocs = changelog => {
  const blocks = [];
  let currentVersion = "";
  let currentSections = [];
  let currentSection = null;

  const pushSection = () => {
    if (currentSection) currentSections.push(currentSection);
    currentSection = null;
  };

  const pushVersion = () => {
    pushSection();
    if (currentVersion) {
      const block = createVersionBlock(currentVersion, currentSections);
      if (block) blocks.push(block);
    }
    currentSections = [];
  };

  for (const line of stripPackageHeading(changelog).split("\n")) {
    const versionMatch = line.match(/^## (.+)$/);
    if (versionMatch) {
      pushVersion();
      currentVersion = versionMatch[1];
      continue;
    }

    const sectionMatch = line.match(/^### (.+)$/);
    if (sectionMatch) {
      pushSection();
      currentSection = {
        title: sectionTitleMap.get(sectionMatch[1]) ?? sectionMatch[1],
        items: [],
      };
      continue;
    }

    if (currentSection && line.startsWith("- ")) currentSection.items.push(line);
  }

  pushVersion();
  return blocks.join("\n\n");
};

const createGeneratedSection = changelog => `${startMarker}
${formatForDocs(changelog)}
${endMarker}`;

const createDocsPage = changelog => `# 更新日志

本文记录 \`@xsbcme/vue-tab-router\` 的重要变更，帮助你了解新能力、行为变化和升级影响。

${createGeneratedSection(changelog)}`;

const sourceChangelog = normalizeContent(await readFile(sourcePath, "utf8"));
const targetChangelog = normalizeContent(await readFile(targetPath, "utf8"));
const nextTargetChangelog = createDocsPage(sourceChangelog);

if (checkOnly) {
  logStep("检查包内更新日志是否已经同步到文档站日志页。该步骤不会修改文件。");

  if (targetChangelog !== normalizeContent(nextTargetChangelog)) {
    console.error("\n[日志同步] 文档日志未同步，已停止发布流程。");
    console.error("[日志同步] 请先执行 `pnpm changelog:sync`，确认 `docs/views/log/index.md` 的变化后一起提交。");
    process.exit(1);
  }

  logStep("检查通过：文档日志已经是最新的。");
  process.exit(0);
}

logStep("开始同步更新日志。");
logStep("来源：packages/vue-tab-router/CHANGELOG.md");
logStep("目标：docs/views/log/index.md");
await writeFile(targetPath, normalizeContent(nextTargetChangelog));
logStep("同步完成：请检查并提交文档日志页的变化。");
