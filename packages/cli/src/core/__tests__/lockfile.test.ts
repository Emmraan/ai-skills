import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { rm } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import * as lockfile from '../../core/lockfile';

const lockfilePath = join(tmpdir(), `test-skills-lock-${Date.now()}.json`);

// Mock the config to use a temp directory
vi.mock('../../core/config', () => ({
  getLockfilePath: () => lockfilePath,
}));

describe('lockfile', () => {
  beforeEach(async () => {
    // Clear the lockfile before each test
    try {
      await rm(lockfilePath, { force: true });
    } catch {
      // File doesn't exist, that's fine
    }
  });

  afterEach(async () => {
    // Clean up after tests
    try {
      await rm(lockfilePath, { force: true });
    } catch {
      // File doesn't exist, that's fine
    }
  });

  it('should read an empty lockfile as initial state', async () => {
    const result = await lockfile.readLockfile();
    expect(result.version).toBe(1);
    expect(result.installedSkills).toEqual({});
  });

  it('should add a skill to lockfile', async () => {
    const skillName = 'react';
    const version = '18.2.0';
    const hash = 'abc123';
    const paths = ['/home/user/.agents/skills/react/SKILLS.md'];

    await lockfile.addSkillToLockfile(skillName, version, hash, paths);

    const result = await lockfile.readLockfile();
    expect(result.installedSkills[skillName]).toBeDefined();
    expect(result.installedSkills[skillName].version).toBe(version);
    expect(result.installedSkills[skillName].hash).toBe(hash);
  });

  it('should remove a skill from lockfile', async () => {
    const skillName = 'react';
    await lockfile.addSkillToLockfile(skillName, '18.2.0', 'hash1', []);

    let result = await lockfile.readLockfile();
    expect(result.installedSkills[skillName]).toBeDefined();

    await lockfile.removeSkillFromLockfile(skillName);

    result = await lockfile.readLockfile();
    expect(result.installedSkills[skillName]).toBeUndefined();
  });

  it('should get installed skills', async () => {
    await lockfile.addSkillToLockfile('react', '18.2.0', 'hash1', []);
    await lockfile.addSkillToLockfile('vue', '3.4.0', 'hash2', []);

    const installed = await lockfile.getInstalledSkills();
    expect(installed).toHaveLength(2);
    expect(installed.map((s) => s.name)).toContain('react');
    expect(installed.map((s) => s.name)).toContain('vue');
  });

  it('should get a specific skill entry', async () => {
    const skillName = 'react';
    const version = '18.2.0';
    const hash = 'abc123';
    const paths = ['/home/user/.agents/skills/react/SKILLS.md'];

    await lockfile.addSkillToLockfile(skillName, version, hash, paths);

    const entry = await lockfile.getSkillEntry(skillName);
    expect(entry).not.toBeNull();
    expect(entry?.name).toBe(skillName);
    expect(entry?.version).toBe(version);
    expect(entry?.hash).toBe(hash);
  });
});
