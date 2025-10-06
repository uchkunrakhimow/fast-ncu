import { cyan, green, red, yellow } from "colorette";
import ora from "ora";
import { COMMAND_NAME, FULL_COMMAND_NAME, VERSION } from "./fetcher";

interface UpgradeInfo {
  current: string;
  latest: string;
  needsUpgrade: boolean;
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
    throw new Error("Failed to check for updates");
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
    throw new Error("Failed to upgrade package");
  }
}

async function runUpgrade(pkgManager: string): Promise<void> {
  const spinner = ora({
    text: cyan("Downloading latest version..."),
    spinner: "dots",
  }).start();

  let progress = 0;
  const progressInterval = setInterval(() => {
    progress += 10;
    if (progress <= 90) {
      const bar =
        "█".repeat(Math.floor(progress / 5)) +
        "░".repeat(20 - Math.floor(progress / 5));
      spinner.text = cyan(`Installing ${bar} ${progress}%`);
    }
  }, 150);

  try {
    await installPackage(pkgManager);
    clearInterval(progressInterval);
    spinner.succeed(green("Installation complete"));
  } catch (error) {
    clearInterval(progressInterval);
    spinner.fail(red("Installation failed"));
    throw error;
  }
}

export async function selfUpgrade(): Promise<void> {
  console.log(cyan(`\nChecking for ${COMMAND_NAME} updates...\n`));

  const startTime = Date.now();

  try {
    const info = await checkUpgrade();

    if (!info.needsUpgrade) {
      console.log(green(`Already on latest version (${info.current})`));
      console.log(
        cyan(`Completed in ${((Date.now() - startTime) / 1000).toFixed(2)}s\n`)
      );
      return;
    }

    console.log(
      yellow(`New version available: ${info.current} → ${info.latest}\n`)
    );

    const pkgManager = await detectGlobalPackageManager();
    await runUpgrade(pkgManager);

    console.log(green(`\nSuccessfully upgraded to ${info.latest}`));
    console.log(
      cyan(`Completed in ${((Date.now() - startTime) / 1000).toFixed(2)}s\n`)
    );
  } catch (error) {
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    if (error instanceof Error) {
      console.error(red(`\n${error.message}`));
    } else {
      console.error(red("\nUnexpected error occurred"));
    }

    console.log(cyan(`Failed after ${duration}s\n`));
    process.exit(1);
  }
}
