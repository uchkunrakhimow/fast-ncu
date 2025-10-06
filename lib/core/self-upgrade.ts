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

async function runUpgrade(
  pkgManager: string,
  installCmd: string
): Promise<void> {
  const spinner = ora({
    text: cyan("Downloading latest version..."),
    spinner: "dots",
  }).start();

  await new Promise((resolve) => setTimeout(resolve, 500));

  spinner.text = cyan("Installing package...");
  await new Promise((resolve) => setTimeout(resolve, 300));

  const proc = Bun.spawn([pkgManager, "install", "-g", FULL_COMMAND_NAME], {
    stdout: "pipe",
    stderr: "pipe",
  });

  const decoder = new TextDecoder();
  let output = "";
  let progress = 0;

  const progressInterval = setInterval(() => {
    progress += 10;
    if (progress <= 90) {
      const bar =
        "█".repeat(Math.floor(progress / 5)) +
        "░".repeat(20 - Math.floor(progress / 5));
      spinner.text = cyan(`Installing ${bar} ${progress}%`);
    }
  }, 200);

  for await (const chunk of proc.stdout) {
    output += decoder.decode(chunk);
  }

  await proc.exited;
  clearInterval(progressInterval);

  if (proc.exitCode === 0) {
    spinner.text = green("Installation complete ✓");
    spinner.succeed();
  } else {
    spinner.fail(red("Installation failed"));
    throw new Error("Failed to upgrade package");
  }
}

export async function selfUpgrade(): Promise<void> {
  console.log(cyan(`\n🔍 Checking for ${COMMAND_NAME} updates...\n`));

  const startTime = Date.now();

  try {
    const info = await checkUpgrade();

    if (!info.needsUpgrade) {
      console.log(green(`✨ Already on latest version (${info.current})`));
      console.log(
        cyan(`⚡ Completed in ${((Date.now() - startTime) / 1000).toFixed(2)}s`)
      );
      return;
    }

    console.log(
      yellow(`📦 New version available: ${info.current} → ${info.latest}\n`)
    );

    let globalPkgManager = "npm";

    try {
      const bunCheck = Bun.spawn(["bun", "--version"], {
        stdout: "pipe",
        stderr: "pipe",
      });
      await bunCheck.exited;

      if (bunCheck.exitCode === 0) {
        const bunList = Bun.spawn(["bun", "pm", "ls", "-g"], {
          stdout: "pipe",
        });
        const bunOutput = await new Response(bunList.stdout).text();
        await bunList.exited;

        if (bunOutput.includes("fast-ncu")) {
          globalPkgManager = "bun";
        }
      }
    } catch {
      globalPkgManager = "npm";
    }

    await runUpgrade(
      globalPkgManager,
      globalPkgManager === "bun" ? "bun install -g" : "npm install -g"
    );

    console.log(green(`\n🎉 Successfully upgraded to ${info.latest}!`));
    console.log(
      cyan(`⚡ Completed in ${((Date.now() - startTime) / 1000).toFixed(2)}s\n`)
    );
  } catch (error) {
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    if (error instanceof Error) {
      console.error(red(`\n❌ ${error.message}`));
    } else {
      console.error(red("\n❌ Unexpected error occurred"));
    }

    console.log(cyan(`⚡ Failed after ${duration}s`));
    process.exit(1);
  }
}
