import { cyan, dim, green, red, yellow } from "colorette";
import ora from "ora";
import { COMMAND_NAME, FULL_COMMAND_NAME, VERSION } from "./fetcher";

interface UpgradeInfo {
  current: string;
  latest: string;
  needsUpgrade: boolean;
}

class UpgradeCheckError extends Error {
  constructor() {
    super(
      "Failed to check for updates - network error or registry unavailable"
    );
    this.name = "UpgradeCheckError";
  }
}

class InstallationError extends Error {
  constructor() {
    super("Failed to upgrade package - installation error");
    this.name = "InstallationError";
  }
}

async function fetchLatestVersion(): Promise<string | null> {
  try {
    const url = `https://registry.npmjs.org/${FULL_COMMAND_NAME}`;
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": `${COMMAND_NAME}/${VERSION}`,
      },
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) return null;

    const data = (await response.json()) as {
      "dist-tags"?: { latest?: string };
    };
    return data["dist-tags"]?.latest || null;
  } catch {
    return null;
  }
}

function compareVersions(current: string, latest: string): boolean {
  const parseCurrent = current.split(".").map(Number);
  const parseLatest = latest.split(".").map(Number);

  for (let i = 0; i < 3; i++) {
    const latestPart = parseLatest[i] ?? 0;
    const currentPart = parseCurrent[i] ?? 0;
    if (latestPart > currentPart) return true;
    if (latestPart < currentPart) return false;
  }
  return false;
}

async function checkUpgrade(): Promise<UpgradeInfo> {
  const latest = await fetchLatestVersion();
  if (!latest) {
    throw new UpgradeCheckError();
  }

  const needsUpgrade = compareVersions(VERSION, latest);

  return {
    current: VERSION,
    latest,
    needsUpgrade,
  };
}

async function detectGlobalPackageManager(): Promise<string> {
  try {
    const whichProc = Bun.spawn(["which", "fncu"], { stdout: "pipe" });
    const whichPath = await new Response(whichProc.stdout).text();
    await whichProc.exited;

    if (whichPath.includes("/.bun/") || whichPath.includes("/bun/")) {
      return "bun";
    }
    return "npm";
  } catch {
    return "npm";
  }
}

async function installPackage(pkgManager: string): Promise<void> {
  const args =
    pkgManager === "bun"
      ? ["add", "-g", FULL_COMMAND_NAME]
      : ["install", "-g", FULL_COMMAND_NAME];

  const proc = Bun.spawn([pkgManager, ...args], {
    stdout: "pipe",
    stderr: "pipe",
  });

  await proc.exited;

  if (proc.exitCode !== 0) {
    throw new InstallationError();
  }
}

async function runUpgrade(pkgManager: string): Promise<void> {
  const spinner = ora({
    text: cyan("Downloading latest version..."),
    spinner: "dots",
  }).start();

  let progress = 0;
  const progressInterval = setInterval(() => {
    progress += 5;
    if (progress <= 100) {
      const filled = Math.floor(progress / 5);
      const empty = 20 - filled;
      const bar = "█".repeat(filled) + "░".repeat(empty);
      spinner.text = cyan(`Installing ${bar} ${progress}%`);
    }
  }, 100);

  try {
    await installPackage(pkgManager);
    clearInterval(progressInterval);

    spinner.text = cyan(`Installing ${"█".repeat(20)} 100%`);
    await new Promise((resolve) => setTimeout(resolve, 200));

    spinner.succeed(green("Installation complete"));
  } catch (error) {
    clearInterval(progressInterval);
    spinner.fail(red("Installation failed"));
    throw error;
  }
}

export async function selfUpgrade(): Promise<void> {
  console.log(cyan(`\nChecking for ${COMMAND_NAME} updates...`));

  const startTime = Date.now();

  try {
    const info = await checkUpgrade();

    if (!info.needsUpgrade) {
      console.log(green(`Already on latest version (${info.current})`));
      console.log(
        dim(`Completed in ${((Date.now() - startTime) / 1000).toFixed(2)}s`)
      );
      return;
    }

    console.log(
      yellow(`New version available: ${info.current} → ${info.latest}`)
    );

    const pkgManager = await detectGlobalPackageManager();
    await runUpgrade(pkgManager);

    console.log(green(`Successfully upgraded to ${info.latest}`));
    console.log(
      dim(`Completed in ${((Date.now() - startTime) / 1000).toFixed(2)}s`)
    );
  } catch (error) {
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    if (error instanceof UpgradeCheckError) {
      console.error(red(error.message));
      console.log(dim(`Failed after ${duration}s`));
      process.exit(2);
    } else if (error instanceof InstallationError) {
      console.error(red(error.message));
      console.log(dim(`Failed after ${duration}s`));
      process.exit(3);
    } else if (error instanceof Error) {
      console.error(red(error.message));
      console.log(dim(`Failed after ${duration}s`));
      process.exit(1);
    } else {
      console.error(red("Unexpected error occurred"));
      console.log(dim(`Failed after ${duration}s`));
      process.exit(1);
    }
  }
}
