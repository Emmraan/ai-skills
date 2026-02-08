import { fetchSkill, fetchRegistryIndex } from '../core/downloader.js';
import { installSkill } from '../core/installer.js';
import { addSkillToLockfile } from '../core/lockfile.js';
import { AGENT_PLATFORMS, type InstallOptions, type InstallLocation } from '../core/config.js';
import { sha256 } from '../utils/hash.js';
import { error, success, info } from '../utils/logger.js';
import { createInterface } from 'readline/promises';
import { stdin as input, stdout as output } from 'process';

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
    if (interactive && input.isTTY && output.isTTY) {
      return promptInstallOptions();
    }
    return { location: 'global', all: true };
  }

  return { location: 'global', all: true };
}

async function promptInstallOptions(): Promise<InstallOptions> {
  const rl = createInterface({ input, output });
  try {
    const locationAnswer = (
      await rl.question(
        'Install location? [1] Local (current project) [2] Global (agent platforms) (default: 2): '
      )
    ).trim();

    const location: InstallLocation = locationAnswer === '1' ? 'local' : 'global';
    if (location === 'local') {
      return { location: 'local' };
    }

    const platformAnswer = (
      await rl.question(
        'Global install target? [1] All platforms [2] Specific platforms (default: 1): '
      )
    ).trim();

    if (platformAnswer !== '2') {
      return { location: 'global', all: true };
    }

    info(`Available platforms: ${AGENT_PLATFORMS.map((p) => p.replace(/^\./, '')).join(', ')}`);
    const selected = (
      await rl.question('Enter comma-separated platform names (example: claude,gemini,vscode): ')
    )
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean);

    return {
      location: 'global',
      all: selected.length === 0,
      platforms: selected,
    };
  } finally {
    rl.close();
  }
}

export async function install(skillName: string, options: InstallOptions = {}): Promise<boolean> {
  try {
    info(`Fetching ${skillName}...`);
    const skillContent = await fetchSkill(skillName);
    const hash = sha256(skillContent);

    info(`Installing ${skillName}...`);
    const installPaths = await installSkill(skillName, skillContent, options);

    if (installPaths.length === 0) {
      error(`Failed to install ${skillName} to any location`);
      return false;
    }

    const index = await fetchRegistryIndex();
    const skillVersion = index.skills[skillName]?.version || 'unknown';

    await addSkillToLockfile(skillName, skillVersion, hash, installPaths);
    success(`Installed ${skillName} (${skillVersion}) to ${installPaths.length} location(s)`);
    return true;
  } catch (err) {
    error(`Failed to install ${skillName}: ${err instanceof Error ? err.message : String(err)}`);
    return false;
  }
}
