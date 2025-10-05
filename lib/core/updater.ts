import { existsSync } from "fs";
import { readFile, writeFile } from "fs/promises";
import { dirname, resolve } from "path";
import semver from "semver";
import type { Options, Results, Update } from "../types";
import { getUpdateLevel, shouldUpdate } from "../utils/ver";

interface PackageJson {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  [key: string]: unknown;
}

function findPackageJson(): string {
  let currentDir = process.cwd();

  while (currentDir !== dirname(currentDir)) {
    const packageJsonPath = resolve(currentDir, "package.json");
    if (existsSync(packageJsonPath)) {
      return packageJsonPath;
    }
    currentDir = dirname(currentDir);
  }

  throw new Error(
    "📁 package.json not found\n" + "🔧 Run from a project directory"
  );
}

async function loadPackageJson(path?: string): Promise<PackageJson> {
  try {
    const packageJsonPath = path || findPackageJson();
    const content = await readFile(packageJsonPath, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("package.json not found")
    ) {
      throw error;
    }
    throw new Error("🔍 Invalid package.json\n" + "🔧 Check JSON syntax");
  }
}

function shouldUpdatePkg(
  name: string,
  current: string,
  latest: string,
  target: string,
  filter?: string
): boolean {
  if (filter && !new RegExp(filter).test(name)) {
    return false;
  }

  if (current === latest) {
    return false;
  }

  return shouldUpdate(current, latest, target);
}

function calculateDiff(current: string, latest: string): string {
  const currentVersion = current.replace(/[\^~]/, "");
  const diff = semver.diff(currentVersion, latest);
  return diff ? `+${diff}` : "0.0.0";
}

async function updatePackageJson(
  packageJson: PackageJson,
  updates: Update[]
): Promise<void> {
  const packageJsonPath = findPackageJson();

  updates.forEach((update) => {
    if (packageJson.dependencies?.[update.name]) {
      packageJson.dependencies[update.name] = `^${update.latest}`;
    }
    if (packageJson.devDependencies?.[update.name]) {
      packageJson.devDependencies[update.name] = `^${update.latest}`;
    }
  });

  await writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2) + "\n");
}

export async function checkUpdates(options: Options = {}): Promise<Results> {
  const { upgrade = false, filter, target = "auto" } = options;

  try {
    const packageJson = await loadPackageJson();
    const allDependencies = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    };

    const packageNames = Object.keys(allDependencies);

    if (packageNames.length === 0) {
      return { updates: [], total: 0, upgraded: false };
    }

    const { fetchLatestVersions } = await import("./fetcher");
    const latestVersions = await fetchLatestVersions(packageNames);

    const fetchedCount = Object.keys(latestVersions).length;
    if (fetchedCount === 0 && packageNames.length > 0) {
      throw new Error(
        "🌐 Network connection failed\n" +
          "🔄 Please check your internet connection and try again"
      );
    }

    const updates: Update[] = [];

    const updatePromises = packageNames.map(async (name) => {
      const current = allDependencies[name];
      const latest = latestVersions[name];

      if (!current || !latest) return null;

      if (shouldUpdatePkg(name, current, latest, target, filter)) {
        const type = getUpdateLevel(current, latest);
        const diff = calculateDiff(current, latest);

        return {
          name,
          current,
          latest,
          type,
          diff,
        } as Update;
      }
      return null;
    });

    const updateResults = await Promise.all(updatePromises);
    updates.push(
      ...updateResults.filter((update): update is Update => update !== null)
    );

    if (upgrade && updates.length > 0) {
      await updatePackageJson(packageJson, updates);
    }

    return {
      updates,
      total: packageNames.length,
      upgraded: upgrade && updates.length > 0,
    };
  } catch (error) {
    throw error;
  }
}
