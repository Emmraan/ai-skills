/* eslint-disable no-console */

import chalk from 'chalk';

export function log(message: string) {
  console.log(message);
}

export function info(message: string) {
  console.log(`${chalk.cyan('ℹ')} ${chalk.gray(message)}`);
}

export function success(message: string) {
  console.log(`${chalk.green('✓')} ${chalk.green(message)}`);
}

export function error(message: string) {
  console.error(`${chalk.red('✗')} ${chalk.red(message)}`);
}

export function warn(message: string) {
  console.warn(`${chalk.yellow('⚠')} ${chalk.yellow(message)}`);
}
