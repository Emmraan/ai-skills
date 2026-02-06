export interface SkillMetadata {
  name: string;
  version: string;
  domains: string[];
  lastGenerated: string;
  lastUpdated: string;
  hash?: string;
}

export interface SourceConfig {
  type: 'url' | 'github_releases' | 'changelog' | 'github_api';
  url?: string;
  repo?: string;
  sections?: string[];
  last_n_releases?: number;
}

export interface SkillSource {
  skill_name: string;
  sources: SourceConfig[];
}

export interface NormalizedSkill {
  name: string;
  purpose: string;
  version: string;
  principles: string[];
  rules: string[];
  patterns: string[];
  anti_patterns: string[];
  security: string[];
  performance: string[];
  tooling: string[];
  version_notes: string[];
  last_updated: string;
  sources: string[];
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export const SKILL_SPEC = {
  required_sections: [
    'name',
    'purpose',
    'version',
    'rules',
    'patterns',
    'anti_patterns',
    'security',
    'performance',
    'tooling',
    'last_updated',
    'sources',
  ],
  section_limits: {
    rules: 10,
    patterns: 10,
    anti_patterns: 5,
    security: 5,
    performance: 5,
    tooling: 5,
  },
};
