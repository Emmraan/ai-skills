import { writeFile, mkdir, readFile, rm } from 'fs/promises';
import { dirname } from 'path';
import { getSkillInstallPaths, getSkillMetadataPaths, type InstallOptions } from './config.js';
import { sha256 } from '../utils/hash.js';
import { info, warn } from '../utils/logger.js';

export async function installSkill(
  skillName: string,
  skillContent: string,
  options: InstallOptions = {}
): Promise<string[]> {
  const installPaths = getSkillInstallPaths(skillName, options);
  const metadataPaths = getSkillMetadataPaths(skillName, options);
  const installedPaths: string[] = [];
  const installedMetadataPaths: string[] = [];
  const hash = sha256(skillContent);
  const installedAt = new Date().toISOString();

  for (let i = 0; i < installPaths.length; i++) {
    const skillPath = installPaths[i];
    const metadataPath = metadataPaths[i];
    try {
      const dir = dirname(skillPath);
      await mkdir(dir, { recursive: true });
      await writeFile(skillPath, skillContent, 'utf-8');
      await writeFile(
        metadataPath,
        JSON.stringify(
          {
            skill: skillName,
            hash,
            installedAt,
            file: 'SKILLS.md',
          },
          null,
          2
        ),
        'utf-8'
      );
      installedPaths.push(skillPath);
      installedMetadataPaths.push(metadataPath);
      info(`Installed to ${skillPath}`);
    } catch (err) {
      warn(
        `Failed to install to ${skillPath}: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  if (installedMetadataPaths.length > 0) {
    info(`Wrote metadata to ${installedMetadataPaths.length} location(s)`);
  }

  return installedPaths;
}

export async function removeSkill(
  skillName: string,
  options: InstallOptions = {}
): Promise<string[]> {
  const installPaths = getSkillInstallPaths(skillName, options);
  const metadataPaths = getSkillMetadataPaths(skillName, options);
  const removedPaths: string[] = [];

  for (let i = 0; i < installPaths.length; i++) {
    const skillPath = installPaths[i];
    const metadataPath = metadataPaths[i];
    const skillDir = dirname(skillPath);
    try {
      await rm(skillPath, { force: true });
      await rm(metadataPath, { force: true });
      await rm(skillDir, { recursive: true, force: true });
      removedPaths.push(skillPath);
      info(`Removed ${skillDir}`);
    } catch (err) {
      warn(`Failed to remove ${skillDir}: ${err instanceof Error ? err.message : String(err)}`);
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
