#!/usr/bin/env node
// Simple SKILLS.md validator

import { readFileSync, readdirSync } from 'fs';
import { join, resolve } from 'path';

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function validateSkill(filePath) {
  const content = readFileSync(filePath, 'utf-8').replace(/\r\n/g, '\n');
  const errors = [];

  // Check for frontmatter
  if (!content.startsWith('---\n')) {
    errors.push('Missing YAML frontmatter');
    return errors;
  }

  // Check for required sections
  const sections = ['Purpose', 'Version', 'Principles', 'Mandatory Rules', 'Recommended Patterns', 
                    'Anti-Patterns', 'Security', 'Performance', 'Tooling', 'Last-Updated', 'Sources'];
  
  for (const sec of sections) {
    if (!content.includes(`## ${sec}`)) {
      errors.push(`Missing section: ${sec}`);
    }
  }

  // Check for minimum content
  const lines = content.split('\n');
  const bulletPoints = lines.filter(l => l.trim().startsWith('-'));
  if (bulletPoints.length < 20) {
    errors.push(`Too few bullet points (${bulletPoints.length}, expected 20+)`);
  }

  return errors;
}

function main() {
  const skillsDir = resolve(process.cwd(), 'packages/skills-registry/skills');
  const skillDirs = readdirSync(skillsDir).filter(f => !f.startsWith('.'));

  console.log(`${colors.blue}Validating SKILLS.md files...${colors.reset}\n`);

  let allValid = true;
  let validCount = 0;

  for (const dir of skillDirs) {
    const path = join(skillsDir, dir, 'SKILLS.md');
    const errors = validateSkill(path);
    
    if (errors.length === 0) {
      console.log(`${colors.green}✓${colors.reset} ${colors.blue}${dir}${colors.reset}`);
      validCount++;
    } else {
      console.log(`${colors.red}✗${colors.reset} ${colors.blue}${dir}${colors.reset}`);
      for (const err of errors) {
        console.log(`  ${colors.red}•${colors.reset} ${err}`);
      }
      allValid = false;
    }
  }

  console.log(`\n${colors.blue}${'─'.repeat(50)}${colors.reset}`);
  console.log(`Valid: ${validCount}/${skillDirs.length}`);

  if (allValid) {
    console.log(`${colors.green}All skills validated!${colors.reset}`);
    process.exit(0);
  } else {
    console.log(`${colors.red}Some skills failed validation!${colors.reset}`);
    process.exit(1);
  }
}

main();
