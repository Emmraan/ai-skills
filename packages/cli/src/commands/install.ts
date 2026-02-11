import { fetchSkill, fetchRegistryIndex } from '../core/downloader.js';
import { installSkill } from '../core/installer.js';
import { addSkillToLockfile } from '../core/lockfile.js';
import { AGENT_PLATFORMS, type InstallOptions, type InstallLocation } from '../core/config.js';
import { sha256 } from '../utils/hash.js';
import { error, highlight, section } from '../utils/logger.js';
import inquirer from 'inquirer';
import { ui } from '../utils/ui.js';
import chalk from 'chalk';
import pc from 'picocolors';

export interface CliInstallFlags {
  local?: boolean;
  global?: boolean;
  all?: boolean;
  platforms?: string[];
}

export function parseInstallFlags(args: string[]): CliInstallFlags {
  const flags: CliInstallFlags = {};

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

export async function resolveInstallOptionsFromFlags(
  flags: CliInstallFlags,
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
      return promptInstallOptions();
    }
    return { location: 'global', all: true };
  }

  return { location: 'global', all: true };
}

async function promptInstallOptions(): Promise<InstallOptions> {
  const { location } = await inquirer.prompt<{ location: InstallLocation }>([
    {
      type: 'list',
      name: 'location',
      message: 'Install location',
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
      message: `${location === 'local' ? 'Local' : 'Global'} install target`,
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
      validate: (value: string[]) =>
        value.length > 0 ? true : 'Please select at least one platform.',
    },
  ]);

  return {
    location,
    all: false,
    platforms,
  };
}

export async function install(skillName: string, options: InstallOptions = {}): Promise<boolean> {
  try {
    section(`Installing ${chalk.bold.cyan(skillName)}`);

    ui.startSpinner(`Fetching ${skillName}...`);
    const skillContent = await fetchSkill(skillName);
    ui.stopSpinnerSuccess(`Fetched ${skillName}`);
    const hash = sha256(skillContent);

    ui.startSpinner(`Installing ${skillName}...`);
    const installPaths = await installSkill(skillName, skillContent, options);
    ui.stopSpinnerSuccess(`Installed files for ${skillName}`);

    if (installPaths.length === 0) {
      error(`Failed to install ${skillName} to any location`);
      return false;
    }

    ui.startSpinner(`Updating lockfile for ${skillName}...`);
    const index = await fetchRegistryIndex();
    const skillVersion = index.skills[skillName]?.version || 'unknown';

    await addSkillToLockfile(skillName, skillVersion, hash, installPaths);
    ui.stopSpinnerSuccess(`Updated lockfile`);

    // eslint-disable-next-line no-console
    console.log('');
    highlight(`✨ Successfully installed ${skillName} (v${skillVersion})`);
    // eslint-disable-next-line no-console
    console.log('');
    // eslint-disable-next-line no-console
    console.log(pc.gray('Location summary:'));
    installPaths.forEach((path) => {
      // eslint-disable-next-line no-console
      console.log(`  ${pc.green('→')} ${pc.cyan(path)}`);
    });
    // eslint-disable-next-line no-console
    console.log('');

    return true;
  } catch (err) {
    ui.stopSpinner();
    error(`Failed to install ${skillName}: ${err instanceof Error ? err.message : String(err)}`);
    return false;
  }
}
