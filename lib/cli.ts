#!/usr/bin/env bun

import { blue, bold, cyan, green, red, yellow } from "colorette";
import { Command } from "commander";
import { checkUpdates } from "./core/checker";
import { COMMAND_NAME, FULL_COMMAND_NAME, VERSION } from "./core/fetcher";
import { selfUpgrade } from "./core/self-upgrade";
import type { Options } from "./types";
import { detectPkgManager } from "./utils/pkg";

const program = new Command();

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
  .option("-w, --workspaces", "check workspaces")
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
        console.log(green("🎯 All packages are up to date!"));
      } else {
        console.log(
          cyan(
            `\n🔍 ${results.updates.length} update${
              results.updates.length > 1 ? "s" : ""
            } available:\n`
          )
        );

        const header = "┌─────────────┬─────────────┬─────────────┬─────────┐";
        const separator =
          "├─────────────┼─────────────┼─────────────┼─────────┤";
        const footer = "└─────────────┴─────────────┴─────────────┴─────────┘";

        console.log(header);
        console.log(
          `│ ${bold("Package".padEnd(11))} │ ${bold(
            "Current".padEnd(11)
          )} │ ${bold("Latest".padEnd(11))} │ ${bold("Type".padEnd(7))} │`
        );
        console.log(separator);

        results.updates.forEach((update) => {
          const name = bold(update.name.padEnd(11));
          const current = yellow(
            update.current.replace(/^[\^~]/, "").padEnd(11)
          );
          const latest = green(update.latest.padEnd(11));

          let typeDisplay = update.type || "";
          let typeColor = blue;
          if (update.type === "major") typeColor = red;
          else if (update.type === "minor") typeColor = yellow;
          else if (update.type === "patch") typeColor = green;

          const type = typeColor(typeDisplay.padEnd(7));
          console.log(`│ ${name} │ ${current} │ ${latest} │ ${type} │`);
        });

        console.log(footer);

        const packageManager = await detectPkgManager();

        if (options.upgrade && results.updates.length > 0) {
          console.log(green("\n🚀 Updated package.json"));
          console.log(blue(`⚡ Run: ${bold(packageManager.installCommand)}`));
        } else if (!options.upgrade && results.updates.length > 0) {
          console.log(
            yellow(`\n🔧 Run: ${bold(`${COMMAND_NAME} -u`)} to update`)
          );
        }
      }

      console.log(cyan(`⚡ Completed in ${duration}s`));
    } catch (error) {
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);

      if (error instanceof Error) {
        if (error.message.includes("package.json not found")) {
          console.error(`${error.message}\n⚡ Failed after ${duration}s`);
        } else if (error.message.includes("Network connection failed")) {
          console.error(`${error.message}\n⚡ Failed after ${duration}s`);
        } else if (error.message.includes("Invalid package.json")) {
          console.error(`${error.message}\n⚡ Failed after ${duration}s`);
        } else {
          console.error(`🚨 Unexpected error\n⚡ Failed after ${duration}s`);
        }
      } else {
        console.error(`🚨 Unexpected error\n⚡ Failed after ${duration}s`);
      }
      process.exit(1);
    }
  });

program
  .command("upgrade")
  .description("Upgrade fncu to the latest version")
  .action(async () => {
    await selfUpgrade();
  });

program.parse();
