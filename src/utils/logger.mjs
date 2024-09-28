import chalk from 'chalk';

export class Logger {
  static info(message) {
    console.log(chalk.blue(`[INFO] ${message}`));
  }

  static warn(message) {
    console.log(chalk.yellow(`[WARN] ${message}`));
  }

  static error(message) {
    console.log(chalk.red(`[ERROR] ${message}`));
  }
}
