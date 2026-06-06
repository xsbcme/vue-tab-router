import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const docsDist = resolve(rootDir, "packages/docs/.vitepress/dist");
const demoDist = resolve(rootDir, "packages/demo/dist");
const demoTarget = resolve(docsDist, "demo");

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

const base = normalizeBase(
  getArgValue("--base") ?? process.env.PAGES_BASE ?? process.env.GITEE_PAGES_BASE ?? process.env.VITEPRESS_BASE
);

console.log(`Building docs with VITEPRESS_BASE=${base}`);
await rm(docsDist, { recursive: true, force: true });
await run(["--filter", "@xsbcme/docs", "build"], { VITEPRESS_BASE: base });

console.log("Building demo");
await run(["--filter", "@xsbcme/demo", "build"]);

console.log("Copying demo into docs output");
await rm(demoTarget, { recursive: true, force: true });
await mkdir(docsDist, { recursive: true });
await cp(demoDist, demoTarget, { recursive: true });
await writeFile(resolve(docsDist, ".nojekyll"), "");

console.log(`Pages output is ready: ${docsDist}`);
console.log(`Docs base: ${base}`);
console.log(`Demo path: ${base === "/" ? "/demo/" : `${base}demo/`}`);