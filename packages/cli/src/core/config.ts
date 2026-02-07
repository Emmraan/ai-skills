import { homedir, platform } from 'os';
import { join } from 'path';

export const REGISTRY_URL =
  'https://raw.githubusercontent.com/Emmraan/ai-skills/main/packages/skills-registry';

export const REGISTRY_INDEX_URL = `${REGISTRY_URL}/skills/.index.json`;

export const AGENT_PLATFORMS = ['.claude', '.gemini', '.vscode', '.opencode', '.codex', '.agents'];

export function getAgentPlatformDirs(): string[] {
  const home = homedir();
  return AGENT_PLATFORMS.map((p) => join(home, p, 'skills'));
}

export function getLockfilePath(): string {
  const home = homedir();
  return join(home, '.ai-skills', '.skill-lock.json');
}

export function getSkillInstallPaths(skillName: string): string[] {
  return getAgentPlatformDirs().map((dir) => join(dir, skillName, 'SKILLS.md'));
}

export const IS_WINDOWS = platform() === 'win32';
