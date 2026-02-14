import chalk from 'chalk';
import pc from 'picocolors';
import ora, { type Ora } from 'ora';
import { log } from '../utils/logger.js';

let activeSpinner: Ora | null = null;

const BOX_CHARS = {
  TOP_LEFT: '╭',
  TOP_RIGHT: '╮',
  BOTTOM_LEFT: '╰',
  BOTTOM_RIGHT: '╯',
  HORIZONTAL: '─',
  VERTICAL: '│',
  T_DOWN: '┬',
  T_UP: '┴',
};

export const ui = {
  bannerShown: false,

  printBanner(): void {
    if (this.bannerShown || !process.stdout.isTTY) {
      return;
    }

    const title = 'AI Skills CLI';
    const subtitle = 'Install framework-agnostic SKILLS.md files';
    const width = Math.max(title.length, subtitle.length) + 6;

    log('');
    log(
      pc.cyan(
        `${BOX_CHARS.TOP_LEFT}${BOX_CHARS.HORIZONTAL.repeat(width - 2)}${BOX_CHARS.TOP_RIGHT}`
      )
    );
    log(
      pc.cyan(`${BOX_CHARS.VERTICAL}`) +
        ` ${chalk.bold.cyan(title)}${' '.repeat(width - 3 - title.length)}` +
        pc.cyan(`${BOX_CHARS.VERTICAL}`)
    );
    log(
      pc.cyan(`${BOX_CHARS.VERTICAL}`) +
        ` ${pc.gray(subtitle)}${' '.repeat(width - 3 - subtitle.length)}` +
        pc.cyan(`${BOX_CHARS.VERTICAL}`)
    );
    log(
      pc.cyan(
        `${BOX_CHARS.BOTTOM_LEFT}${BOX_CHARS.HORIZONTAL.repeat(width - 2)}${BOX_CHARS.BOTTOM_RIGHT}`
      )
    );
    log('');

    this.bannerShown = true;
  },

  printSection(title: string): void {
    log('');
    log(chalk.bold.cyan(`${BOX_CHARS.VERTICAL} ${title}`));
    log(chalk.cyan(`${BOX_CHARS.VERTICAL}${BOX_CHARS.HORIZONTAL.repeat(title.length + 2)}`));
  },

  printDivider(char: string = '─'): void {
    log(chalk.gray(char.repeat(60)));
  },

  printBox(content: string[], title?: string): void {
    // eslint-disable-next-line no-control-regex
    const maxLength = Math.max(
      // eslint-disable-next-line no-control-regex
      ...content.map((line) => line.replace(/\u001b\[[0-9;]*m/g, '').length)
    );
    const width = Math.min(maxLength + 4, 70);

    if (title) {
      log(
        chalk.cyan(
          `${BOX_CHARS.TOP_LEFT}${BOX_CHARS.HORIZONTAL.repeat(width - 2)}${BOX_CHARS.TOP_RIGHT}`
        )
      );
    }

    content.forEach((line) => {
      // eslint-disable-next-line no-control-regex
      const padding = width - 4 - line.replace(/\u001b\[[0-9;]*m/g, '').length;
      log(
        chalk.cyan(`${BOX_CHARS.VERTICAL} `) +
          line +
          ' '.repeat(Math.max(0, padding)) +
          chalk.cyan(` ${BOX_CHARS.VERTICAL}`)
      );
    });

    log(
      chalk.cyan(
        `${BOX_CHARS.BOTTOM_LEFT}${BOX_CHARS.HORIZONTAL.repeat(width - 2)}${BOX_CHARS.BOTTOM_RIGHT}`
      )
    );
  },

  startSpinner(text: string): void {
    if (!process.stdout.isTTY) {
      return;
    }

    if (activeSpinner) {
      activeSpinner.stop();
    }
    activeSpinner = ora({
      text: chalk.cyan(text),
      spinner: 'dots2',
    }).start();
  },

  stopSpinnerSuccess(text?: string): void {
    if (!activeSpinner) {
      return;
    }
    activeSpinner.succeed(chalk.green(text || 'Done'));
    activeSpinner = null;
  },

  stopSpinnerFail(text?: string): void {
    if (!activeSpinner) {
      return;
    }
    activeSpinner.fail(chalk.red(text || 'Failed'));
    activeSpinner = null;
  },

  stopSpinner(): void {
    if (!activeSpinner) {
      return;
    }
    activeSpinner.stop();
    activeSpinner = null;
  },

  updateSpinner(text: string): void {
    if (activeSpinner) {
      activeSpinner.text = chalk.cyan(text);
    }
  },

  printTable(rows: Array<string[]>, headers?: string[]): void {
    if (headers) {
      const headerRow = headers.map((h) => chalk.bold.cyan(h));
      const separators = headers.map((h) => chalk.gray('─'.repeat(Math.max(h.length, 15))));

      const maxWidths = headers.map((h, i) =>
        Math.max(h.length, ...rows.map((r) => r[i]?.length || 0))
      );

      log(headerRow.map((h, i) => h.padEnd(maxWidths[i])).join(' ' + chalk.gray('│') + ' '));
      log(separators.join('─' + chalk.gray('┼') + '─'));

      rows.forEach((row) => {
        log(row.map((cell, i) => cell.padEnd(maxWidths[i])).join(' ' + chalk.gray('│') + ' '));
      });
    } else {
      rows.forEach((row) => {
        log('  ' + row.join('  '));
      });
    }
  },

  printSummary(items: Array<{ label: string; value: string | number }>): void {
    log('');
    const maxLabelLength = Math.max(...items.map((i) => i.label.length));
    items.forEach((item) => {
      const paddedLabel = item.label.padEnd(maxLabelLength);
      log(chalk.gray(`  ${paddedLabel}  `) + chalk.bold(String(item.value)));
    });
    log('');
  },

  printSuccess(message: string): void {
    log(chalk.green(`✓ ${message}`));
  },

  printError(message: string): void {
    log(chalk.red(`✗ ${message}`));
  },

  printWarning(message: string): void {
    log(chalk.yellow(`⚠ ${message}`));
  },

  printInfo(message: string): void {
    log(chalk.cyan(`ℹ ${message}`));
  },
};
