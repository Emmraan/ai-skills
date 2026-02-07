import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as downloader from '../../core/downloader';

vi.mock('../../utils/retry', () => ({
  fetchWithRetry: vi.fn(),
}));

describe('downloader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch registry index', async () => {
    const { fetchWithRetry } = await import('../../utils/retry');
    const mockIndex = {
      skills: {
        react: {
          version: '18.2.0',
          domains: ['frontend', 'ui'],
          lastGenerated: '2026-02-06T00:00:00Z',
        },
      },
    };

    vi.mocked(fetchWithRetry).mockResolvedValue(JSON.stringify(mockIndex));

    const result = await downloader.fetchRegistryIndex();
    expect(result.skills.react).toBeDefined();
    expect(result.skills.react.version).toBe('18.2.0');
  });

  it('should fetch skill markdown', async () => {
    const { fetchWithRetry } = await import('../../utils/retry');
    const mockContent = '# React Skill\n\nSome content';

    vi.mocked(fetchWithRetry).mockResolvedValue(mockContent);

    const result = await downloader.fetchSkill('react');
    expect(result).toBe(mockContent);
  });

  it('should get available skills', async () => {
    const { fetchWithRetry } = await import('../../utils/retry');
    const mockIndex = {
      skills: {
        react: {
          version: '18.2.0',
          domains: ['frontend'],
          lastGenerated: '2026-02-06T00:00:00Z',
        },
        vue: {
          version: '3.4.0',
          domains: ['frontend'],
          lastGenerated: '2026-02-06T00:00:00Z',
        },
      },
    };

    vi.mocked(fetchWithRetry).mockResolvedValue(JSON.stringify(mockIndex));

    const result = await downloader.getAvailableSkills();
    expect(result).toContain('react');
    expect(result).toContain('vue');
    expect(result).toHaveLength(2);
  });
});
