/* eslint-disable no-console */

import chalk from 'chalk';
import pc from 'picocolors';

export function log(message: string) {
  console.log(message);
}

export function info(message: string) {
  console.log(`${chalk.cyan('ℹ')} ${chalk.gray(message)}`);
}

export function success(message: string) {
  console.log(`${pc.green('✓')} ${chalk.green(message)}`);
}

export function error(message: string) {
  console.error(`${pc.red('✗')} ${chalk.red(message)}`);
}

export function warn(message: string) {
  console.warn(`${pc.yellow('⚠')} ${chalk.yellow(message)}`);
}

export function debug(message: string) {
  if (process.env.DEBUG) {
    console.log(`${chalk.gray('→')} ${chalk.gray(message)}`);
  }
}

export function divider() {
  console.log(pc.gray('─'.repeat(60)));
}

export function section(title: string) {
  console.log('');
  console.log(chalk.bold.cyan(`► ${title}`));
  console.log(pc.gray('─'.repeat(title.length + 2)));
}

export function highlight(message: string) {
  console.log(chalk.bold.cyan(message));
}

export function badge(label: string, content: string) {
  console.log(`${chalk.bgCyan.black(` ${label} `)} ${pc.cyan(content)}`);
}

export function card(title: string, content: string[]) {
  console.log('');
  console.log(chalk.bold.cyan(`┌─ ${title}`));
  content.forEach((line) => {
    console.log(chalk.cyan('│') + ` ${line}`);
  });
  console.log(chalk.cyan('└' + '─'.repeat(title.length + 3)));
  console.log('');
}

export function progressBar(label: string, current: number, total: number) {
  const percentage = Math.round((current / total) * 100);
  const filled = Math.floor((percentage / 100) * 20);
  const empty = 20 - filled;
  const bar = `${pc.green('█'.repeat(filled))}${pc.gray('░'.repeat(empty))}`;
  console.log(`${label}: [${bar}] ${pc.cyan(`${percentage}%`)}`);
}
