import { removeSkill } from '../core/installer.js';
import { removeSkillFromLockfile, getSkillEntry } from '../core/lockfile.js';
import { error, success, info } from '../utils/logger.js';

export async function remove(skillName: string): Promise<boolean> {
  try {
    const entry = await getSkillEntry(skillName);
    if (!entry) {
      info(`${skillName} is not installed`);
      return true;
    }

    info(`Removing ${skillName}...`);
    await removeSkill(skillName);
    await removeSkillFromLockfile(skillName);
    success(`Removed ${skillName}`);
    return true;
  } catch (err) {
    error(`Failed to remove ${skillName}: ${err instanceof Error ? err.message : String(err)}`);
    return false;
  }
}
