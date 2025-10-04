import { existsSync } from "fs";
import { readFile } from "fs/promises";
import { resolve } from "path";
import type { PkgManager } from "../types";

export async function detectPkgManager(): Promise<PkgManager> {
  const cwd = process.cwd();

  if (
    existsSync(resolve(cwd, "bun.lockb")) ||
    existsSync(resolve(cwd, "bun.lock"))
  ) {
    return {
      name: "bun",
      installCommand: "bun install",
      lockFile: "bun.lockb",
    };
  }

  if (existsSync(resolve(cwd, "pnpm-lock.yaml"))) {
    return {
      name: "pnpm",
      installCommand: "pnpm install",
      lockFile: "pnpm-lock.yaml",
    };
  }

  if (existsSync(resolve(cwd, "yarn.lock"))) {
    return {
      name: "yarn",
      installCommand: "yarn install",
      lockFile: "yarn.lock",
    };
  }

  try {
    const packageJsonPath = resolve(cwd, "package.json");
    if (existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(await readFile(packageJsonPath, "utf-8"));
      const packageManager = packageJson.packageManager;

      if (packageManager) {
        if (packageManager.startsWith("bun")) {
          return {
            name: "bun",
            installCommand: "bun install",
            lockFile: "bun.lockb",
          };
        }
        if (packageManager.startsWith("pnpm")) {
          return {
            name: "pnpm",
            installCommand: "pnpm install",
            lockFile: "pnpm-lock.yaml",
          };
        }
        if (packageManager.startsWith("yarn")) {
          return {
            name: "yarn",
            installCommand: "yarn install",
            lockFile: "yarn.lock",
          };
        }
      }
    }
  } catch {
    // Ignore errors and fall back to npm
  }

  return {
    name: "npm",
    installCommand: "npm install",
    lockFile: "package-lock.json",
  };
}
