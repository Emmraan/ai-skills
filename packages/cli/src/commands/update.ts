import { fetchSkill, fetchRegistryIndex } from '../core/downloader.js';
import { installSkill } from '../core/installer.js';
import { addSkillToLockfile, getInstalledSkills, getSkillEntry } from '../core/lockfile.js';
import { sha256 } from '../utils/hash.js';
import { error, success, info, warn } from '../utils/logger.js';

export async function update(options: { force?: boolean; skill?: string } = {}): Promise<boolean> {
  try {
    const installed = await getInstalledSkills();
    const index = await fetchRegistryIndex();

    if (options.skill) {
      // Update specific skill
      const skillName = options.skill;
      const entry = await getSkillEntry(skillName);

      if (!entry) {
        warn(`${skillName} is not installed`);
        return false;
      }

      const skillContent = await fetchSkill(skillName);
      const newHash = sha256(skillContent);

      if (newHash === entry.hash && !options.force) {
        info(`${skillName} is already up-to-date`);
        return true;
      }

      info(`Updating ${skillName}...`);
      const installPaths = await installSkill(skillName, skillContent);
      const version = index.skills[skillName]?.version || 'unknown';
      await addSkillToLockfile(skillName, version, newHash, installPaths);
      success(`Updated ${skillName}`);
      return true;
    }

    // Update all installed skills
    let updateCount = 0;
    for (const entry of installed) {
      try {
        const skillContent = await fetchSkill(entry.name);
        const newHash = sha256(skillContent);

        if (newHash === entry.hash && !options.force) {
          info(`${entry.name} is already up-to-date`);
          continue;
        }

        info(`Updating ${entry.name}...`);
        const installPaths = await installSkill(entry.name, skillContent);
        const version = index.skills[entry.name]?.version || 'unknown';
        await addSkillToLockfile(entry.name, version, newHash, installPaths);
        success(`Updated ${entry.name}`);
        updateCount++;
      } catch (err) {
        error(
          `Failed to update ${entry.name}: ${err instanceof Error ? err.message : String(err)}`
        );
      }
    }

    success(`Updated ${updateCount} skill(s)`);
    return true;
  } catch (err) {
    error(`Update failed: ${err instanceof Error ? err.message : String(err)}`);
    return false;
  }
}
