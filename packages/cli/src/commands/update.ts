import { fetchSkill, fetchRegistryIndex } from '../core/downloader.js';
import { installSkill } from '../core/installer.js';
import { addSkillToLockfile, getInstalledSkills, getSkillEntry } from '../core/lockfile.js';
import { sha256 } from '../utils/hash.js';
import { error, success, info, warn, section, highlight, divider } from '../utils/logger.js';
import chalk from 'chalk';
import pc from 'picocolors';

export async function update(options: { force?: boolean; skill?: string } = {}): Promise<boolean> {
  try {
    const installed = await getInstalledSkills();
    const index = await fetchRegistryIndex();

    if (options.skill) {
      // Update specific skill
      const skillName = options.skill;
      section(`Updating ${chalk.bold.cyan(skillName)}`);

      const entry = await getSkillEntry(skillName);

      if (!entry) {
        // eslint-disable-next-line no-console
        console.log('');
        warn(`${skillName} is not installed`);
        // eslint-disable-next-line no-console
        console.log('');
        return false;
      }

      const skillContent = await fetchSkill(skillName);
      const newHash = sha256(skillContent);

      if (newHash === entry.hash && !options.force) {
        // eslint-disable-next-line no-console
        console.log('');
        info(`${skillName} is already up-to-date (v${entry.version})`);
        // eslint-disable-next-line no-console
        console.log('');
        return true;
      }

      info(`Updating ${skillName}...`);
      const installPaths = await installSkill(skillName, skillContent);
      const version = index.skills[skillName]?.version || 'unknown';
      await addSkillToLockfile(skillName, version, newHash, installPaths);

      // eslint-disable-next-line no-console
      console.log('');
      highlight(`✨ Successfully updated ${skillName} to v${version}`);
      // eslint-disable-next-line no-console
      console.log('');
      success(`Updated at ${installPaths.length} location(s)`);
      // eslint-disable-next-line no-console
      console.log('');
      return true;
    }

    // Update all installed skills
    section('Updating all installed skills');
    // eslint-disable-next-line no-console
    console.log('');

    let updateCount = 0;
    let alreadyUpToDate = 0;

    for (const entry of installed) {
      try {
        // eslint-disable-next-line no-console
        console.log(pc.cyan(`► ${entry.name} (v${entry.version})`));
        const skillContent = await fetchSkill(entry.name);
        const newHash = sha256(skillContent);

        if (newHash === entry.hash && !options.force) {
          // eslint-disable-next-line no-console
          console.log(`  ${pc.gray('→')} Already up-to-date`);
          alreadyUpToDate++;
          continue;
        }

        const installPaths = await installSkill(entry.name, skillContent);
        const version = index.skills[entry.name]?.version || 'unknown';
        await addSkillToLockfile(entry.name, version, newHash, installPaths);
        // eslint-disable-next-line no-console
        console.log(`  ${pc.green('✓')} Updated to v${version}`);
        updateCount++;
      } catch (err) {
        // eslint-disable-next-line no-console
        console.log(`  ${pc.red('✗')} Error: ${err instanceof Error ? err.message : String(err)}`);
      }
    }

    // eslint-disable-next-line no-console
    console.log('');
    divider();
    // eslint-disable-next-line no-console
    console.log('');
    // eslint-disable-next-line no-console
    console.log(chalk.bold('Update Summary:'));
    // eslint-disable-next-line no-console
    console.log(`  ${pc.green('✓')} Updated: ${chalk.bold(updateCount.toString())} skill(s)`);
    // eslint-disable-next-line no-console
    console.log(`  ${pc.gray('→')} Up-to-date: ${chalk.bold(alreadyUpToDate.toString())} skill(s)`);
    // eslint-disable-next-line no-console
    console.log('');
    // eslint-disable-next-line no-console
    console.log('');

    return true;
  } catch (err) {
    error(`Update failed: ${err instanceof Error ? err.message : String(err)}`);
    return false;
  }
}
