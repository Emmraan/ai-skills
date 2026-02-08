import chalk from 'chalk';
import ora, { type Ora } from 'ora';
import { info } from '../utils/logger.js';

let activeSpinner: Ora | null = null;

export const ui = {
  bannerShown: false,

  printBanner(): void {
    if (this.bannerShown || !process.stdout.isTTY) {
      return;
    }

    const title = chalk.bold.cyan('AI Skills CLI');
    const subtitle = chalk.gray('Install framework-agnostic SKILLS.md files');
    // Subtle, single-line banner to keep npx output concise
    info(`${title} ${chalk.gray('•')} ${subtitle}`);
    this.bannerShown = true;
  },

  startSpinner(text: string): void {
    if (!process.stdout.isTTY) {
      return;
    }

    if (activeSpinner) {
      activeSpinner.stop();
    }
    activeSpinner = ora({ text, spinner: 'dots' }).start();
  },

  stopSpinnerSuccess(text?: string): void {
    if (!activeSpinner) {
      return;
    }
    activeSpinner.succeed(text);
    activeSpinner = null;
  },

  stopSpinnerFail(text?: string): void {
    if (!activeSpinner) {
      return;
    }
    activeSpinner.fail(text);
    activeSpinner = null;
  },

  stopSpinner(): void {
    if (!activeSpinner) {
      return;
    }
    activeSpinner.stop();
    activeSpinner = null;
  },
};

