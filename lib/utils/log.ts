import { blue, cyan, gray, green, red, yellow } from "colorette";
import ora, { type Ora } from "ora";

class Logger {
  public spinner?: Ora;

  info(message: string, ...args: unknown[]): void {
    console.log(blue(`ℹ️  ${message}`), ...args);
  }

  success(message: string, ...args: unknown[]): void {
    console.log(green(`✅ ${message}`), ...args);
  }

  error(message: string, ...args: unknown[]): void {
    console.error(red(`❌ ${message}`), ...args);
  }

  warn(message: string, ...args: unknown[]): void {
    console.warn(yellow(`⚠️  ${message}`), ...args);
  }

  await(message: string): Ora {
    if (this.spinner) {
      this.spinner.succeed();
    }
    this.spinner = ora(cyan(message)).start();
    return this.spinner;
  }

  progress(message: string): void {
    console.log(gray(`⏳ ${message}`));
  }

  debug(message: string, ...args: unknown[]): void {
    if (process.env.DEBUG) {
      console.log(gray(`🐛 ${message}`), ...args);
    }
  }
}

export const logger = new Logger();

process.on("SIGINT", () => {
  if (logger.spinner) {
    logger.spinner.stop();
  }
});
