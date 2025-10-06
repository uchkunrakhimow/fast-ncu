#!/usr/bin/env bun

import { bold, cyan, dim, green, red, yellow } from "colorette";
import { Command } from "commander";
import { COMMAND_NAME, FULL_COMMAND_NAME, VERSION } from "./core/fetcher";
import { checkUpdates } from "./core/updater";
import { selfUpgrade } from "./core/upgrade";
import type { Options, Update } from "./types";
import { logger } from "./utils/log";
import { detectPkgManager } from "./utils/manager";

const program = new Command();

function getTypeColor(type: string): (str: string) => string {
  if (type === "major") return red;
  if (type === "minor") return yellow;
  if (type === "patch") return green;
  return cyan;
}

function renderTable(updates: Update[]): void {
  const maxNameLen = Math.max(
    ...updates.map((u) => u.name.length),
    "Package".length
  );
  const maxCurrentLen = Math.max(
    ...updates.map((u) => u.current.replace(/^[\^~]/, "").length),
    "Current".length
  );
  const maxLatestLen = Math.max(
    ...updates.map((u) => u.latest.length),
    "Latest".length
  );
  const typeLen = 7;

  const namePad = maxNameLen + 2;
  const currentPad = maxCurrentLen + 2;
  const latestPad = maxLatestLen + 2;

  const horizontal = "─";
  const vertical = "│";

  const top = `┌${horizontal.repeat(namePad)}┬${horizontal.repeat(
    currentPad
  )}┬${horizontal.repeat(latestPad)}┬${horizontal.repeat(typeLen + 2)}┐`;

  const separator = `├${horizontal.repeat(namePad)}┼${horizontal.repeat(
    currentPad
  )}┼${horizontal.repeat(latestPad)}┼${horizontal.repeat(typeLen + 2)}┤`;

  const bottom = `└${horizontal.repeat(namePad)}┴${horizontal.repeat(
    currentPad
  )}┴${horizontal.repeat(latestPad)}┴${horizontal.repeat(typeLen + 2)}┘`;

  console.log(top);
  console.log(
    `${vertical} ${bold("Package".padEnd(namePad - 1))}${vertical} ${bold(
      "Current".padEnd(currentPad - 1)
    )}${vertical} ${bold("Latest".padEnd(latestPad - 1))}${vertical} ${bold(
      "Type".padEnd(typeLen)
    )} ${vertical}`
  );
  console.log(separator);

  updates.forEach((update) => {
    const name = bold(update.name.padEnd(namePad - 1));
    const current = yellow(
      update.current.replace(/^[\^~]/, "").padEnd(currentPad - 1)
    );
    const latest = green(update.latest.padEnd(latestPad - 1));
    const typeColor = getTypeColor(update.type);
    const type = typeColor(update.type.padEnd(typeLen));

    console.log(
      `${vertical} ${name}${vertical} ${current}${vertical} ${latest}${vertical} ${type} ${vertical}`
    );
  });

  console.log(bottom);
}

function handleError(error: unknown, duration: string): never {
  if (error instanceof Error) {
    if (error.message.includes("package.json not found")) {
      logger.error(error.message);
    } else if (error.message.includes("Network connection failed")) {
      logger.error(error.message);
    } else if (error.message.includes("Invalid package.json")) {
      logger.error(error.message);
    } else {
      logger.error("Unexpected error occurred");
      if (process.env.DEBUG) {
        console.error(error);
      }
    }
  } else {
    logger.error("Unexpected error occurred");
  }

  console.log(dim(`Failed after ${duration}s`));
  process.exit(1);
}

program
  .name(COMMAND_NAME!)
  .description("A blazing-fast CLI tool for checking npm package updates")
  .version(VERSION)
  .addHelpText(
    "before",
    `Usage: ${COMMAND_NAME} [options] or ${FULL_COMMAND_NAME} [options]
       ${COMMAND_NAME} upgrade - Upgrade to the latest version\n`
  )
  .option("-u, --upgrade", "upgrade package.json dependencies")
  .option("-f, --filter <pattern>", "filter packages by name (regex)")
  .option("-j, --json", "output as JSON")
  .option(
    "-t, --target <level>",
    "upgrade version target: auto, major, minor, patch",
    "auto"
  )
  .option(
    "-w, --workspaces [name]",
    "check workspaces: all, root, or specific workspace name"
  )
  .action(async (options: Options) => {
    const startTime = Date.now();

    try {
      const results = await checkUpdates(options);

      if (options.json) {
        console.log(JSON.stringify(results, null, 2));
        return;
      }

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);

      if (results.updates.length === 0) {
        logger.success("All packages are up to date!");
        console.log(dim(`Completed in ${duration}s`));
        return;
      }

      if (options.upgrade) {
        const packageNames = results.updates.map((u) => u.name).join(", ");
        console.log(
          green(
            `Updated ${results.updates.length} package${
              results.updates.length > 1 ? "s" : ""
            }: ${bold(packageNames)}`
          )
        );

        const packageManager = await detectPkgManager();
        console.log(cyan(`Run: ${bold(packageManager.installCommand)}`));
        console.log(dim(`Completed in ${duration}s`));
        return;
      }

      if (results.workspaces && results.workspaces.length > 0) {
        console.log(
          cyan(
            `\nMonorepo detected (${results.workspaces.length} workspace${
              results.workspaces.length > 1 ? "s" : ""
            })`
          )
        );

        for (const workspace of results.workspaces) {
          console.log(
            bold(
              `\n${workspace.name} ${dim(`(${workspace.path})`)} - ${
                workspace.updates.length
              } update${workspace.updates.length > 1 ? "s" : ""}:`
            )
          );
          console.log();
          renderTable(workspace.updates);
        }

        console.log(
          cyan(`\nRun: ${bold(`${COMMAND_NAME} -u`)} to update all workspaces`)
        );
        console.log(dim(`Completed in ${duration}s`));
        return;
      }

      console.log(
        cyan(
          `\n${results.updates.length} update${
            results.updates.length > 1 ? "s" : ""
          } available:\n`
        )
      );

      renderTable(results.updates);

      console.log(cyan(`\nRun: ${bold(`${COMMAND_NAME} -u`)} to update`));
      console.log(dim(`Completed in ${duration}s`));
    } catch (error) {
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      handleError(error, duration);
    }
  });

program
  .command("upgrade")
  .description("Upgrade fncu to the latest version")
  .action(async () => {
    await selfUpgrade();
  });

program.parse();
