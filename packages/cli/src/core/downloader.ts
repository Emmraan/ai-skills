import { REGISTRY_INDEX_URL, REGISTRY_URL } from './config.js';
import { fetchWithRetry } from '../utils/retry.js';

export interface SkillIndexEntry {
  version: string;
  domains: string[];
  lastGenerated: string;
}

export interface SkillIndex {
  skills: Record<string, SkillIndexEntry>;
}

export async function fetchRegistryIndex(): Promise<SkillIndex> {
  const content = await fetchWithRetry(REGISTRY_INDEX_URL);
  return JSON.parse(content);
}

export async function fetchSkill(skillName: string): Promise<string> {
  const url = `${REGISTRY_URL}/skills/${skillName}/SKILLS.md`;
  return fetchWithRetry(url);
}

export async function getAvailableSkills(): Promise<string[]> {
  const index = await fetchRegistryIndex();
  return Object.keys(index.skills);
}
