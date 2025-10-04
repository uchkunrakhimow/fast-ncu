import { readFileSync } from "fs";
import { resolve } from "path";
import type { PkgInfo } from "../types";

const packageJson = JSON.parse(
  readFileSync(resolve(process.cwd(), "package.json"), "utf-8")
);

const VERSION = packageJson.version;
const COMMAND_NAME = "fncu";
const FULL_COMMAND_NAME = "fast-ncu";
const BATCH_SIZE = 50;

const USER_AGENT = `${COMMAND_NAME}/${VERSION}`;

class RegistryFetcher {
  private cache = new Map<string, string>();
  private maxCacheSize = 1000;

  async fetchPkgInfo(packageName: string): Promise<string | null> {
    try {
      if (this.cache.has(packageName)) {
        return this.cache.get(packageName)!;
      }

      const url = `https://registry.npmjs.org/${packageName}`;

      const response = await fetch(url, {
        headers: {
          Accept: "application/json",
          "User-Agent": USER_AGENT,
          Connection: "keep-alive",
        },
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) {
        return null;
      }

      const data = (await response.json()) as PkgInfo;
      const latestVersion = data["dist-tags"]?.latest;

      if (latestVersion) {
        if (this.cache.size >= this.maxCacheSize) {
          const firstKey = this.cache.keys().next().value;
          if (firstKey) {
            this.cache.delete(firstKey);
          }
        }
        this.cache.set(packageName, latestVersion);
        return latestVersion;
      }

      return null;
    } catch {
      return null;
    }
  }

  async fetchBatchPkgs(
    packageNames: string[]
  ): Promise<Record<string, string>> {
    const results: Record<string, string> = {};

    const batches = [];
    for (let i = 0; i < packageNames.length; i += BATCH_SIZE) {
      batches.push(packageNames.slice(i, i + BATCH_SIZE));
    }

    const allPromises = batches.map(async (batch) => {
      const batchPromises = batch.map(async (name) => {
        try {
          const latestVersion = await this.fetchPkgInfo(name);
          return { name, latestVersion };
        } catch {
          return { name, latestVersion: null };
        }
      });

      const batchResults = await Promise.allSettled(batchPromises);
      return batchResults;
    });

    const allBatchResults = await Promise.allSettled(allPromises);

    allBatchResults.forEach((batchResult) => {
      if (batchResult.status === "fulfilled") {
        batchResult.value.forEach((result) => {
          if (result.status === "fulfilled" && result.value.latestVersion) {
            results[result.value.name] = result.value.latestVersion;
          }
        });
      }
    });

    return results;
  }

  destroy(): void {
    this.cache.clear();
  }
}

let globalFetcher: RegistryFetcher | undefined;

function getFetcher(): RegistryFetcher {
  if (!globalFetcher) {
    globalFetcher = new RegistryFetcher();
  }
  return globalFetcher;
}

export function cleanup(): void {
  if (globalFetcher) {
    globalFetcher.destroy();
    globalFetcher = undefined;
  }
}

export async function fetchLatestVersions(
  packageNames: string[]
): Promise<Record<string, string>> {
  const fetcher = getFetcher();
  return await fetcher.fetchBatchPkgs(packageNames);
}

export { COMMAND_NAME, FULL_COMMAND_NAME, VERSION };

process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);
process.on("exit", cleanup);
