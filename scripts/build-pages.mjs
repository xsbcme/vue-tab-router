import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const docsDist = resolve(rootDir, "packages/docs/.vitepress/dist");
const pagesDist = resolve(rootDir, "dist/pages");
const demoDist = resolve(rootDir, "packages/demo/dist");
const docTarget = resolve(pagesDist, "doc");
const demoTarget = resolve(pagesDist, "demo");

const getArgValue = name => {
  const inlineArg = process.argv.find(arg => arg.startsWith(`${name}=`));
  if (inlineArg) return inlineArg.slice(name.length + 1);

  const argIndex = process.argv.indexOf(name);
  return argIndex >= 0 ? process.argv[argIndex + 1] : undefined;
};

const normalizeBase = base => {
  if (!base) return "/vue-tab-router/";
  if (base === "/" || base === "./") return base;

  const prefixed = base.startsWith("/") ? base : `/${base}`;
  return prefixed.endsWith("/") ? prefixed : `${prefixed}/`;
};

const joinUrl = (...parts) => {
  const normalized = parts
    .filter(Boolean)
    .map((part, index) => {
      if (index === 0) return part.replace(/\/+$/g, "");
      return part.replace(/^\/+|\/+$/g, "");
    })
    .filter(Boolean)
    .join("/");

  return normalized.startsWith("/") ? `${normalized}/` : `/${normalized}/`;
};

const run = (args, env = {}) => {
  const command = "pnpm";

  return new Promise((resolveRun, reject) => {
    const child = spawn(command, args, {
      cwd: rootDir,
      env: { ...process.env, ...env },
      shell: process.platform === "win32",
      stdio: "inherit",
    });

    child.on("error", reject);
    child.on("close", code => {
      if (code === 0) {
        resolveRun();
        return;
      }

      reject(new Error(`${command} ${args.join(" ")} exited with code ${code}`));
    });
  });
};

const writeHtmlRedirect = async (targetDir, targetUrl, title) => {
  await mkdir(targetDir, { recursive: true });
  await writeFile(
    resolve(targetDir, "index.html"),
    `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta http-equiv="refresh" content="0; url=${targetUrl}">
    <title>${title}</title>
    <script>window.location.replace(${JSON.stringify(targetUrl)} + window.location.search + window.location.hash);</script>
  </head>
  <body>
    <a href="${targetUrl}">Redirecting...</a>
  </body>
</html>
`
  );
};

const base = normalizeBase(getArgValue("--base") ?? process.env.PAGES_BASE ?? process.env.VITEPRESS_BASE);
const docsBase = joinUrl(base, "doc");
const demoBase = joinUrl(base, "demo");
const demoUrl = `https://xsbcme.github.io${demoBase}`;

console.log(`Building docs with VITEPRESS_BASE=${docsBase}`);
await rm(docsDist, { recursive: true, force: true });
await rm(pagesDist, { recursive: true, force: true });
await run(["--filter", "@xsbcme/docs", "build"], { VITEPRESS_BASE: docsBase, DOCS_DEMO_URL: demoUrl });

console.log("Copying docs into Pages output");
await mkdir(pagesDist, { recursive: true });
await cp(docsDist, docTarget, { recursive: true });

console.log("Building demo");
await run(["--filter", "@xsbcme/demo", "build"]);

console.log("Copying demo into Pages output");
await rm(demoTarget, { recursive: true, force: true });
await cp(demoDist, demoTarget, { recursive: true });

console.log("Creating Pages root redirect");
await writeHtmlRedirect(pagesDist, docsBase, "VueTabRouter 文档");
await writeFile(resolve(pagesDist, ".nojekyll"), "");

console.log(`Pages output is ready: ${pagesDist}`);
console.log(`Root path: ${base}`);
console.log(`Docs path: ${docsBase}`);
console.log(`Demo path: ${demoBase}`);