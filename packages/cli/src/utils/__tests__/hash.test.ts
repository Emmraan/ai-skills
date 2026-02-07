import { describe, it, expect } from 'vitest';
import { sha256 } from '../../utils/hash';

describe('hash', () => {
  it('should hash a string consistently', () => {
    const content = 'test content';
    const hash1 = sha256(content);
    const hash2 = sha256(content);
    expect(hash1).toBe(hash2);
  });

  it('should produce different hashes for different content', () => {
    const hash1 = sha256('content1');
    const hash2 = sha256('content2');
    expect(hash1).not.toBe(hash2);
  });

  it('should produce valid sha256 hash (64 hex characters)', () => {
    const hash = sha256('test');
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });
});
