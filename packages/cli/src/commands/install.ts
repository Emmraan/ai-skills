import { fetchSkill, fetchRegistryIndex } from '../core/downloader.js';
import { installSkill } from '../core/installer.js';
import { addSkillToLockfile } from '../core/lockfile.js';
import { sha256 } from '../utils/hash.js';
import { error, success, info } from '../utils/logger.js';

export async function install(skillName: string): Promise<boolean> {
  try {
    info(`Fetching ${skillName}...`);
    const skillContent = await fetchSkill(skillName);
    const hash = sha256(skillContent);

    info(`Installing ${skillName}...`);
    const installPaths = await installSkill(skillName, skillContent);

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
