import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../core/downloader', () => ({
  fetchSkill: vi.fn(),
  fetchRegistryIndex: vi.fn(),
}));

vi.mock('../../core/installer', () => ({
  installSkill: vi.fn(),
}));

vi.mock('../../core/lockfile', () => ({
  addSkillToLockfile: vi.fn(),
}));

import { install } from '../../commands/install';

describe('install command', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('uses registry index version when writing lockfile', async () => {
    const downloader = await import('../../core/downloader');
    const installer = await import('../../core/installer');
    const lockfile = await import('../../core/lockfile');

    vi.mocked(downloader.fetchSkill).mockResolvedValue('# React Skill');
    vi.mocked(downloader.fetchRegistryIndex).mockResolvedValue({
      skills: {
        react: {
          version: '18.2.0',
          domains: ['frontend'],
          lastGenerated: '2026-02-06T00:00:00Z',
        },
      },
    });
    vi.mocked(installer.installSkill).mockResolvedValue(['/tmp/.agents/skills/react/SKILLS.md']);

    const ok = await install('react');
    expect(ok).toBe(true);
    expect(lockfile.addSkillToLockfile).toHaveBeenCalledWith(
      'react',
      '18.2.0',
      expect.stringMatching(/^[a-f0-9]{64}$/),
      ['/tmp/.agents/skills/react/SKILLS.md']
    );
  });
});
