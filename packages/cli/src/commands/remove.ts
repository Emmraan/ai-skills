import { removeSkill } from '../core/installer.js';
import {
  removeSkillFromLockfile,
  getSkillEntry,
  updateSkillInstallPathsInLockfile,
} from '../core/lockfile.js';
import { AGENT_PLATFORMS, type InstallLocation, type InstallOptions } from '../core/config.js';
import { error, info, section, highlight } from '../utils/logger.js';
import { ui } from '../utils/ui.js';
import inquirer from 'inquirer';
import chalk from 'chalk';
import pc from 'picocolors';

export interface CliRemoveFlags {
  local?: boolean;
  global?: boolean;
  all?: boolean;
  platforms?: string[];
}

export function parseRemoveFlags(args: string[]): CliRemoveFlags {
  const flags: CliRemoveFlags = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--local') {
      flags.local = true;
    } else if (arg === '--global') {
      flags.global = true;
    } else if (arg === '--all') {
      flags.all = true;
    } else if (arg === '--platform') {
      const value = args[i + 1];
      if (!value || value.startsWith('--')) {
        throw new Error('Missing value for --platform. Example: --platform claude,gemini');
      }
      i++;
      const parsed = value
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean);
      flags.platforms = [...(flags.platforms ?? []), ...parsed];
    }
  }

  return flags;
}

export async function resolveRemoveOptionsFromFlags(
  flags: CliRemoveFlags,
  interactive: boolean
): Promise<InstallOptions> {
  if (flags.local && flags.global) {
    throw new Error('Use only one of --local or --global');
  }

  const hasAnyFlag = Boolean(
    flags.local || flags.global || flags.all || (flags.platforms ?? []).length
  );

  if (flags.local) {
    return {
      location: 'local',
      all: flags.all || !flags.platforms || flags.platforms.length === 0,
      platforms: flags.platforms,
    };
  }

  if (flags.global) {
    return {
      location: 'global',
      all: flags.all || !flags.platforms || flags.platforms.length === 0,
      platforms: flags.platforms,
    };
  }

  if ((flags.platforms ?? []).length > 0 || flags.all) {
    return {
      location: 'global',
      all: flags.all,
      platforms: flags.platforms,
    };
  }

  if (!hasAnyFlag) {
    if (interactive && process.stdin.isTTY && process.stdout.isTTY) {
      return promptRemoveOptions();
    }
    return { location: 'global', all: true };
  }

  return { location: 'global', all: true };
}

async function promptRemoveOptions(): Promise<InstallOptions> {
  const { location } = await inquirer.prompt<{ location: InstallLocation }>([
    {
      type: 'list',
      name: 'location',
      message: 'Remove from location',
      choices: [
        { name: 'Local (current project)', value: 'local' },
        { name: 'Global (agent platforms)', value: 'global' },
      ],
      default: 'global',
    },
  ]);

  const { target } = await inquirer.prompt<{ target: 'all' | 'specific' }>([
    {
      type: 'list',
      name: 'target',
      message: `${location === 'local' ? 'Local' : 'Global'} remove target`,
      choices: [
        { name: 'All platforms', value: 'all' },
        { name: 'Specific platforms', value: 'specific' },
      ],
      default: 'all',
    },
  ]);

  if (target === 'all') {
    return { location, all: true };
  }

  const platformChoices = AGENT_PLATFORMS.map((platform) => {
    const value = platform.replace(/^\./, '');
    return { name: value, value };
  });

  const { platforms } = await inquirer.prompt<{ platforms: string[] }>([
    {
      type: 'checkbox',
      name: 'platforms',
      message: 'Select target platforms',
      choices: platformChoices,
      pageSize: 10,
    },
  ]);

  return {
    location,
    all: platforms.length === 0,
    platforms,
  };
}

export async function remove(skillName: string, options: InstallOptions = {}): Promise<boolean> {
  try {
    section(`Removing ${chalk.bold.cyan(skillName)}`);

    const entry = await getSkillEntry(skillName);
    if (!entry) {
      // eslint-disable-next-line no-console
      console.log('');
      info(`${skillName} is not installed`);
      // eslint-disable-next-line no-console
      console.log('');
      return true;
    }

    ui.startSpinner(`Removing ${skillName}...`);
    const removedPaths = await removeSkill(skillName, options);

    const remaining = entry.installPaths.filter((p) => !removedPaths.includes(p));
    if (remaining.length === 0) {
      await removeSkillFromLockfile(skillName);
    } else {
      await updateSkillInstallPathsInLockfile(skillName, remaining);
    }

    ui.stopSpinnerSuccess(`Removed files for ${skillName}`);

    // Print summary
    // eslint-disable-next-line no-console
    console.log('');
    highlight(`✨ Successfully removed ${skillName}`);
    // eslint-disable-next-line no-console
    console.log('');
    // eslint-disable-next-line no-console
    console.log(pc.gray('Removed from locations:'));
    removedPaths.forEach((path) => {
      // eslint-disable-next-line no-console
      console.log(`  ${pc.red('✗')} ${pc.cyan(path)}`);
    });

    if (remaining.length > 0) {
      // eslint-disable-next-line no-console
      console.log('');
      // eslint-disable-next-line no-console
      console.log(pc.gray('Still installed at:'));
      remaining.forEach((path) => {
        // eslint-disable-next-line no-console
        console.log(`  ${pc.green('✓')} ${pc.cyan(path)}`);
      });
    }
    // eslint-disable-next-line no-console
    console.log('');

    return true;
  } catch (err) {
    ui.stopSpinner();
    error(`Failed to remove ${skillName}: ${err instanceof Error ? err.message : String(err)}`);
    return false;
  }
}
