import { cp, mkdtemp, readdir, readFile, rm } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const distDir = resolve(rootDir, "dist/pages");

const getArgValue = name => {
  const inlineArg = process.argv.find(arg => arg.startsWith(`${name}=`));
  if (inlineArg) return inlineArg.slice(name.length + 1);

  const argIndex = process.argv.indexOf(name);
  return argIndex >= 0 ? process.argv[argIndex + 1] : undefined;
};

const hasArg = name => process.argv.includes(name);

const help = () => {
  console.log(`Usage: pnpm deploy:pages -- [options]

Options:
  --base <path>       VitePress base path. Default: /vue-tab-router/
  --remote <name>     Git remote name. Default: origin
  --branch <name>     Pages branch name. Default: gh-pages
  --message <text>    Commit message. Default: deploy pages
  --skip-build        Publish existing dist/pages
  --help              Show this help message

Examples:
  pnpm deploy:pages
  pnpm deploy:pages -- --base /vue-tab-router/
  pnpm deploy:pages -- --remote origin --branch gh-pages
`);
};

const run = (command, args, options = {}) => {
  const stdio = options.capture ? "pipe" : "inherit";

  return new Promise((resolveRun, reject) => {
    const child = spawn(command, args, {
      cwd: options.cwd ?? rootDir,
      env: { ...process.env, ...options.env },
      shell: process.platform === "win32",
      stdio,
    });

    let stdout = "";
    let stderr = "";

    if (options.capture) {
      child.stdout?.on("data", chunk => {
        stdout += chunk.toString();
      });
      child.stderr?.on("data", chunk => {
        stderr += chunk.toString();
      });
    }

    child.on("error", reject);
    child.on("close", code => {
      if (code === 0) {
        resolveRun({ stdout, stderr });
        return;
      }

      reject(new Error(`${command} ${args.join(" ")} exited with code ${code}${stderr ? `\n${stderr}` : ""}`));
    });
  });
};

const git = (args, options = {}) => run("git", args, options);

const branchExists = async (remote, branch) => {
  try {
    await git(["ls-remote", "--exit-code", "--heads", remote, branch], { capture: true });
    return true;
  } catch {
    return false;
  }
};

const clearWorktree = async worktreeDir => {
  const entries = await readdir(worktreeDir, { withFileTypes: true });

  await Promise.all(
    entries
      .filter(entry => entry.name !== ".git")
      .map(entry => rm(join(worktreeDir, entry.name), { recursive: true, force: true }))
  );
};

if (hasArg("--help")) {
  help();
  process.exit(0);
}

const base = getArgValue("--base") ?? process.env.PAGES_BASE ?? process.env.VITEPRESS_BASE ?? "/vue-tab-router/";
const remote = getArgValue("--remote") ?? "origin";
const branch = getArgValue("--branch") ?? "gh-pages";
const message = getArgValue("--message") ?? "deploy pages";

if (!hasArg("--skip-build")) {
  await run(process.execPath, ["scripts/build-pages.mjs", "--base", base]);
}

await readFile(resolve(distDir, "index.html"));

const tempDir = await mkdtemp(join(tmpdir(), "vue-tab-router-pages-"));
const worktreeDir = resolve(tempDir, "worktree");

try {
  if (await branchExists(remote, branch)) {
    await git(["worktree", "add", "--force", "-B", branch, worktreeDir, `${remote}/${branch}`]);
  } else {
    await git(["worktree", "add", "--force", "--detach", worktreeDir, "HEAD"]);
    await git(["checkout", "--orphan", branch], { cwd: worktreeDir });
  }

  await clearWorktree(worktreeDir);
  await cp(distDir, worktreeDir, { recursive: true });

  await git(["add", "-A"], { cwd: worktreeDir });
  const status = await git(["status", "--porcelain"], { cwd: worktreeDir, capture: true });

  if (!status.stdout.trim()) {
    console.log("No Pages changes to publish.");
  } else {
    await git(["commit", "-m", message], { cwd: worktreeDir });
    await git(["push", remote, `${branch}:${branch}`], { cwd: worktreeDir });
  }

  console.log(`Published Pages files to ${remote}/${branch}`);
} finally {
  await git(["worktree", "remove", "--force", worktreeDir], { capture: true }).catch(() => undefined);
  await rm(tempDir, { recursive: true, force: true });
}