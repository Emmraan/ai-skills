import { homedir, platform } from 'os';
import { join } from 'path';

export const REGISTRY_URL =
  'https://raw.githubusercontent.com/Emmraan/ai-skills/main/packages/skills-registry';

export const REGISTRY_INDEX_URL = `${REGISTRY_URL}/skills/.index.json`;

export const AGENT_PLATFORMS = ['.claude', '.gemini', '.vscode', '.opencode', '.codex', '.agents'];

export type InstallLocation = 'local' | 'global';

export interface InstallOptions {
  location?: InstallLocation;
  platforms?: string[];
  all?: boolean;
}

export interface ResolvedInstallOptions {
  location: InstallLocation;
  platforms: string[];
}

export function getAgentPlatformDirs(): string[] {
  const home = homedir();
  return AGENT_PLATFORMS.map((p) => join(home, p, 'skills'));
}

export function resolveInstallOptions(options: InstallOptions = {}): ResolvedInstallOptions {
  const location: InstallLocation = options.location ?? 'global';

  const normalized = (options.platforms ?? []).map((p) => normalizePlatformName(p));
  const unique = [...new Set(normalized)];

  if (options.all || unique.length === 0) {
    return { location, platforms: [...AGENT_PLATFORMS] };
  }

  for (const p of unique) {
    if (!AGENT_PLATFORMS.includes(p)) {
      throw new Error(`Unknown platform: ${p}. Supported: ${AGENT_PLATFORMS.join(', ')}`);
    }
  }

  return { location, platforms: unique };
}

function normalizePlatformName(name: string): string {
  const trimmed = name.trim();
  return trimmed.startsWith('.') ? trimmed : `.${trimmed}`;
}

function getSelectedPlatformDirs(resolved: ResolvedInstallOptions): string[] {
  const baseDir = resolved.location === 'local' ? process.cwd() : homedir();
  return resolved.platforms.map((p) => join(baseDir, p, 'skills'));
}

export function getLockfilePath(): string {
  const home = homedir();
  return join(home, '.ai-skills', '.skill-lock.json');
}

export function getSkillInstallPaths(skillName: string, options: InstallOptions = {}): string[] {
  const resolved = resolveInstallOptions(options);
  return getSelectedPlatformDirs(resolved).map((dir) => join(dir, skillName, 'SKILLS.md'));
}

export function getSkillMetadataPaths(skillName: string, options: InstallOptions = {}): string[] {
  const resolved = resolveInstallOptions(options);
  return getSelectedPlatformDirs(resolved).map((dir) =>
    join(dir, skillName, '.skill-metadata.json')
  );
}

export const IS_WINDOWS = platform() === 'win32';
