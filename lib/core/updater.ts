import { existsSync } from "fs";
import { readFile, writeFile } from "fs/promises";
import { dirname, join, resolve } from "path";
import semver from "semver";
import type { Options, Results, Update } from "../types";
import { getUpdateLevel, shouldUpdate } from "../utils/version";
import { detectWorkspaces, getAllDependencies } from "../utils/workspace";

interface PackageJson {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  [key: string]: unknown;
}

const VERSION_PREFIX = "^";

class PackageNotFoundError extends Error {
  constructor() {
    super("package.json not found in current directory or parent directories");
    this.name = "PackageNotFoundError";
  }
}

class InvalidPackageError extends Error {
  constructor() {
    super("Invalid package.json - check JSON syntax");
    this.name = "InvalidPackageError";
  }
}

class NetworkError extends Error {
  constructor() {
    super("Network connection failed - check your internet connection");
    this.name = "NetworkError";
  }
}

function findPackageJson(): string {
  let currentDir = process.cwd();
  const root = dirname(currentDir);

  while (currentDir !== root) {
    const packageJsonPath = resolve(currentDir, "package.json");
    if (existsSync(packageJsonPath)) {
      return packageJsonPath;
    }
    currentDir = dirname(currentDir);
  }

  throw new PackageNotFoundError();
}

async function loadPackageJson(path?: string): Promise<PackageJson> {
  try {
    const packageJsonPath = path || findPackageJson();
    const content = await readFile(packageJsonPath, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    if (error instanceof PackageNotFoundError) {
      throw error;
    }
    throw new InvalidPackageError();
  }
}

function matchesFilter(packageName: string, filter?: string): boolean {
  if (!filter) return true;

  try {
    return new RegExp(filter).test(packageName);
  } catch {
    return false;
  }
}

function shouldUpdatePackage(
  name: string,
  current: string,
  latest: string,
  target: string,
  filter?: string
): boolean {
  if (!matchesFilter(name, filter)) {
    return false;
  }

  if (current === latest) {
    return false;
  }

  return shouldUpdate(current, latest, target);
}

function cleanVersion(version: string): string {
  return version.replace(/^[\^~]/, "");
}

function calculateDiff(current: string, latest: string): string {
  const currentVersion = cleanVersion(current);

  if (!semver.valid(currentVersion) || !semver.valid(latest)) {
    return "unknown";
  }

  return semver.diff(currentVersion, latest) || "none";
}

function applyUpdates(
  packageJson: PackageJson,
  updates: Update[]
): PackageJson {
  const updated = { ...packageJson };

  for (const update of updates) {
    if (updated.dependencies?.[update.name]) {
      updated.dependencies[update.name] = `${VERSION_PREFIX}${update.latest}`;
    }
    if (updated.devDependencies?.[update.name]) {
      updated.devDependencies[
        update.name
      ] = `${VERSION_PREFIX}${update.latest}`;
    }
  }

  return updated;
}

async function savePackageJson(
  packageJson: PackageJson,
  path: string
): Promise<void> {
  const content = JSON.stringify(packageJson, null, 2) + "\n";
  await writeFile(path, content);
}

async function fetchPackageVersions(
  packageNames: string[]
): Promise<Record<string, string>> {
  const { fetchLatestVersions } = await import("./fetcher");
  return await fetchLatestVersions(packageNames);
}

function validateFetchResults(
  latestVersions: Record<string, string>,
  totalPackages: number
): void {
  const fetchedCount = Object.keys(latestVersions).length;
  if (fetchedCount === 0 && totalPackages > 0) {
    throw new NetworkError();
  }
}

async function findUpdatesForPackages(
  dependencies: Record<string, string>,
  target: string,
  filter?: string
): Promise<Update[]> {
  const packageNames = Object.keys(dependencies);

  if (packageNames.length === 0) {
    return [];
  }

  const latestVersions = await fetchPackageVersions(packageNames);
  validateFetchResults(latestVersions, packageNames.length);

  const updates: Update[] = [];

  for (const name of packageNames) {
    const current = dependencies[name];
    const latest = latestVersions[name];

    if (!current || !latest) continue;

    if (shouldUpdatePackage(name, current, latest, target, filter)) {
      updates.push({
        name,
        current,
        latest,
        type: getUpdateLevel(current, latest),
        diff: calculateDiff(current, latest),
      });
    }
  }

  return updates;
}

async function processRootPackage(options: Options): Promise<Results> {
  const { upgrade = false, filter, target = "auto" } = options;

  const packageJson = await loadPackageJson();
  const allDependencies = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  };

  const updates = await findUpdatesForPackages(allDependencies, target, filter);

  if (upgrade && updates.length > 0) {
    const updated = applyUpdates(packageJson, updates);
    await savePackageJson(updated, findPackageJson());
  }

  return {
    updates,
    total: Object.keys(allDependencies).length,
    upgraded: upgrade && updates.length > 0,
  };
}

async function processWorkspaces(options: Options): Promise<Results> {
  const { upgrade = false, filter, target = "auto" } = options;

  const rootDir = dirname(findPackageJson());
  const workspacePackages = await detectWorkspaces(rootDir);

  if (workspacePackages.length === 0) {
    return await processRootPackage(options);
  }

  const allUpdates: Update[] = [];
  let totalDeps = 0;

  const rootPackageJson = await loadPackageJson();
  const rootDeps = {
    ...rootPackageJson.dependencies,
    ...rootPackageJson.devDependencies,
  };

  if (Object.keys(rootDeps).length > 0) {
    const rootUpdates = await findUpdatesForPackages(rootDeps, target, filter);
    allUpdates.push(...rootUpdates);
    totalDeps += Object.keys(rootDeps).length;

    if (upgrade && rootUpdates.length > 0) {
      const updated = applyUpdates(rootPackageJson, rootUpdates);
      await savePackageJson(updated, findPackageJson());
    }
  }

  for (const workspace of workspacePackages) {
    const workspaceDeps = getAllDependencies(workspace.packageJson);

    if (Object.keys(workspaceDeps).length === 0) continue;

    const workspaceUpdates = await findUpdatesForPackages(
      workspaceDeps,
      target,
      filter
    );

    allUpdates.push(...workspaceUpdates);
    totalDeps += Object.keys(workspaceDeps).length;

    if (upgrade && workspaceUpdates.length > 0) {
      const packageJsonPath = join(workspace.path, "package.json");
      const updated = applyUpdates(
        workspace.packageJson as PackageJson,
        workspaceUpdates
      );
      await savePackageJson(updated, packageJsonPath);
    }
  }

  return {
    updates: allUpdates,
    total: totalDeps,
    upgraded: upgrade && allUpdates.length > 0,
  };
}

export async function checkUpdates(options: Options = {}): Promise<Results> {
  if (options.workspaces) {
    return await processWorkspaces(options);
  }

  return await processRootPackage(options);
}
