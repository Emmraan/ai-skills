import { writeFile, mkdir, readFile, rm } from 'fs/promises';
import { dirname } from 'path';
import { getSkillInstallPaths } from './config.js';
import { info, warn } from '../utils/logger.js';

export async function installSkill(skillName: string, skillContent: string): Promise<string[]> {
  const installPaths = getSkillInstallPaths(skillName);
  const installedPaths: string[] = [];

  for (const skillPath of installPaths) {
    try {
      const dir = dirname(skillPath);
      await mkdir(dir, { recursive: true });
      await writeFile(skillPath, skillContent, 'utf-8');
      installedPaths.push(skillPath);
      info(`Installed to ${skillPath}`);
    } catch (err) {
      warn(
        `Failed to install to ${skillPath}: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  return installedPaths;
}

export async function removeSkill(skillName: string): Promise<string[]> {
  const installPaths = getSkillInstallPaths(skillName);
  const removedPaths: string[] = [];

  for (const skillPath of installPaths) {
    try {
      await rm(skillPath, { force: true });
      removedPaths.push(skillPath);
      info(`Removed ${skillPath}`);
    } catch (err) {
      warn(`Failed to remove ${skillPath}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  return removedPaths;
}

export async function skillExists(skillName: string): Promise<boolean> {
  const installPaths = getSkillInstallPaths(skillName);

  for (const skillPath of installPaths) {
    try {
      await readFile(skillPath, 'utf-8');
      return true;
    } catch {
      // Continue checking other paths
    }
  }

  return false;
}

export async function readSkill(skillName: string): Promise<string | null> {
  const installPaths = getSkillInstallPaths(skillName);

  for (const skillPath of installPaths) {
    try {
      return await readFile(skillPath, 'utf-8');
    } catch {
      // Continue checking other paths
    }
  }

  return null;
}
