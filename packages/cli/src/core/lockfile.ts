import { readFile, writeFile, mkdir } from 'fs/promises';
import { dirname } from 'path';
import { getLockfilePath } from './config.js';

export interface LockfileEntry {
  name: string;
  version: string;
  hash: string;
  timestamp: string;
  installPaths: string[];
}

export interface Lockfile {
  version: 1;
  installedSkills: Record<string, LockfileEntry>;
}

const INITIAL_LOCKFILE: Lockfile = {
  version: 1,
  installedSkills: {},
};

export async function readLockfile(): Promise<Lockfile> {
  const path = getLockfilePath();
  try {
    const content = await readFile(path, 'utf-8');
    return JSON.parse(content);
  } catch {
    return INITIAL_LOCKFILE;
  }
}

export async function writeLockfile(lockfile: Lockfile): Promise<void> {
  const path = getLockfilePath();
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, JSON.stringify(lockfile, null, 2), 'utf-8');
}

export async function addSkillToLockfile(
  skillName: string,
  version: string,
  hash: string,
  installPaths: string[]
): Promise<void> {
  const lockfile = await readLockfile();
  lockfile.installedSkills[skillName] = {
    name: skillName,
    version,
    hash,
    timestamp: new Date().toISOString(),
    installPaths,
  };
  await writeLockfile(lockfile);
}

export async function removeSkillFromLockfile(skillName: string): Promise<void> {
  const lockfile = await readLockfile();
  delete lockfile.installedSkills[skillName];
  await writeLockfile(lockfile);
}

export async function getInstalledSkills(): Promise<LockfileEntry[]> {
  const lockfile = await readLockfile();
  return Object.values(lockfile.installedSkills);
}

export async function getSkillEntry(skillName: string): Promise<LockfileEntry | null> {
  const lockfile = await readLockfile();
  return lockfile.installedSkills[skillName] || null;
}
