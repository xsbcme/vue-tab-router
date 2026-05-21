import path from "node:path";
import fs from "node:fs";

function findWorkspaceRootSync() {
  let dir = __dirname;
  while (true) {
    const workspaceConfigPath = path.join(dir, "pnpm-workspace.yaml");
    if (fs.existsSync(workspaceConfigPath)) {
      return dir;
    }
    const newDir = path.dirname(dir);
    if (newDir === dir) {
      throw new Error("Could not find pnpm-workspace.yaml");
    }
    dir = newDir;
  }
}

interface PackageInfo {
  name?: string;
  version?: string;
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
}

function findPackageInfoSync(cwd: string = __dirname) {
  const resolvePath = path.resolve(cwd, "package.json");
  const pkgString = fs.readFileSync(resolvePath, "utf-8");
  return JSON.parse(pkgString) as PackageInfo;
}

const rootPath = findWorkspaceRootSync();
const rootPkg = findPackageInfoSync(rootPath);
const rootDependencies = Object.keys(rootPkg.dependencies || {});
const rootPeerDependencies = Object.keys(rootPkg.peerDependencies || {});

function externalSubprojectDependencies(cwd: string) {
  const subprojectPkgInfo = findPackageInfoSync(cwd);
  return (id: string) =>
    [...rootDependencies, ...Object.keys(subprojectPkgInfo.dependencies || {})].some(
      p => p === id || id.startsWith(`${p}/`)
    );
}

export {
  type PackageInfo,
  findWorkspaceRootSync,
  findPackageInfoSync,
  rootDependencies,
  rootPeerDependencies,
  externalSubprojectDependencies,
};
