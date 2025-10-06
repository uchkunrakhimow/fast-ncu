import { existsSync } from "fs";
import { readFile, readdir } from "fs/promises";
import { join, resolve } from "path";
import type { WorkspacePackage } from "../types";

const PNPM_WORKSPACE_FILE = "pnpm-workspace.yaml";
const PNPM_PACKAGE_PATTERN = /packages:\s*\n((?:\s+-\s+.+\n?)+)/;
const YAML_LIST_ITEM_PATTERN = /^-\s+['"]?|['"]?$/g;

async function readPackageJson(path: string): Promise<Record<string, unknown>> {
  try {
    const content = await readFile(path, "utf-8");
    return JSON.parse(content);
  } catch {
    return {};
  }
}

function cleanWorkspacePattern(pattern: string): string {
  return pattern.replace(/\/\*$/, "");
}

function isValidPackage(packageJson: Record<string, unknown>): boolean {
  return typeof packageJson.name === "string" && packageJson.name.length > 0;
}

async function scanWorkspaceDirectory(
  workspaceDir: string
): Promise<WorkspacePackage[]> {
  const packages: WorkspacePackage[] = [];

  try {
    const entries = await readdir(workspaceDir, { withFileTypes: true });

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;

      const packagePath = join(workspaceDir, entry.name);
      const packageJsonPath = join(packagePath, "package.json");

      if (!existsSync(packageJsonPath)) continue;

      const packageJson = await readPackageJson(packageJsonPath);

      if (isValidPackage(packageJson)) {
        packages.push({
          name: packageJson.name as string,
          path: packagePath,
          packageJson,
        });
      }
    }
  } catch {
    return [];
  }

  return packages;
}

async function findWorkspacePackages(
  rootDir: string,
  workspacePatterns: string[]
): Promise<WorkspacePackage[]> {
  const allPackages: WorkspacePackage[] = [];

  for (const pattern of workspacePatterns) {
    const cleanPattern = cleanWorkspacePattern(pattern);
    const workspaceDir = resolve(rootDir, cleanPattern);

    if (!existsSync(workspaceDir)) continue;

    const packages = await scanWorkspaceDirectory(workspaceDir);
    allPackages.push(...packages);
  }

  return allPackages;
}

function extractWorkspacePatternsFromPackageJson(
  packageJson: Record<string, unknown>
): string[] {
  const { workspaces } = packageJson;

  if (Array.isArray(workspaces)) {
    return workspaces;
  }

  if (typeof workspaces === "object" && workspaces !== null) {
    const ws = workspaces as { packages?: string[] };
    return ws.packages || [];
  }

  return [];
}

function parsePnpmWorkspaceYaml(content: string): string[] {
  const packagesMatch = content.match(PNPM_PACKAGE_PATTERN);

  if (!packagesMatch || !packagesMatch[1]) {
    return [];
  }

  return packagesMatch[1]
    .split("\n")
    .map((line) => line.trim().replace(YAML_LIST_ITEM_PATTERN, ""))
    .filter(Boolean);
}

async function readPnpmWorkspacePatterns(rootDir: string): Promise<string[]> {
  const pnpmWorkspacePath = join(rootDir, PNPM_WORKSPACE_FILE);

  if (!existsSync(pnpmWorkspacePath)) {
    return [];
  }

  try {
    const content = await readFile(pnpmWorkspacePath, "utf-8");
    return parsePnpmWorkspaceYaml(content);
  } catch {
    return [];
  }
}

export async function detectWorkspaces(
  rootDir: string
): Promise<WorkspacePackage[]> {
  const packageJsonPath = join(rootDir, "package.json");

  if (!existsSync(packageJsonPath)) {
    return [];
  }

  const rootPackageJson = await readPackageJson(packageJsonPath);

  let workspacePatterns =
    extractWorkspacePatternsFromPackageJson(rootPackageJson);

  if (workspacePatterns.length === 0) {
    workspacePatterns = await readPnpmWorkspacePatterns(rootDir);
  }

  if (workspacePatterns.length === 0) {
    return [];
  }

  return await findWorkspacePackages(rootDir, workspacePatterns);
}

export function getAllDependencies(
  packageJson: Record<string, unknown>
): Record<string, string> {
  const dependencies = (packageJson.dependencies || {}) as Record<
    string,
    string
  >;
  const devDependencies = (packageJson.devDependencies || {}) as Record<
    string,
    string
  >;

  return {
    ...dependencies,
    ...devDependencies,
  };
}
