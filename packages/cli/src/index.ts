import { install, parseInstallFlags, resolveInstallOptionsFromFlags } from './commands/install.js';
import { remove, parseRemoveFlags, resolveRemoveOptionsFromFlags } from './commands/remove.js';
import { list } from './commands/list.js';
import { update } from './commands/update.js';
import { generateLocal } from './commands/generate-local.js';
import { error, info } from './utils/logger.js';
import { ui } from './utils/ui.js';

const args = process.argv.slice(2);

export async function main(): Promise<void> {
  ui.printBanner();

  if (args.length === 0) {
    showHelp();
    return;
  }

  const command = args[0];

  try {
    if (command === 'install' && args.length >= 2) {
      const skill = args[1];
      const flags = parseInstallFlags(args.slice(2));
      const options = await resolveInstallOptionsFromFlags(flags, true);
      const success = await install(skill, options);
      process.exit(success ? 0 : 1);
    } else if (command === 'remove' && args.length >= 2) {
      const skill = args[1];
      const flags = parseRemoveFlags(args.slice(2));
      const options = await resolveRemoveOptionsFromFlags(flags, true);
      const success = await remove(skill, options);
      process.exit(success ? 0 : 1);
    } else if (command === 'list') {
      const jsonFlag = args.includes('--json');
      await list(jsonFlag);
      process.exit(0);
    } else if (command === 'update') {
      const forceFlag = args.includes('--force');
      let skillArg: string | undefined;
      const skillIndex = args.indexOf('--skill');
      if (skillIndex !== -1 && args.length > skillIndex + 1) {
        skillArg = args[skillIndex + 1];
      }
      const success = await update({ force: forceFlag, skill: skillArg });
      process.exit(success ? 0 : 1);
    } else if (command === 'generate-local') {
      const skillArg = args[1];
      const success = await generateLocal(skillArg);
      process.exit(success ? 0 : 1);
    } else if (!command.startsWith('-')) {
      // Default behavior: treat first arg as skill name to install
      const flags = parseInstallFlags(args.slice(1));
      const options = await resolveInstallOptionsFromFlags(flags, true);
      const success = await install(command, options);
      process.exit(success ? 0 : 1);
    } else {
      showHelp();
    }
  } catch (err) {
    error(`CLI error: ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  }
}

function showHelp() {
  info(`
AI Skills CLI - Install framework-agnostic SKILLS.md files

Usage:
  ai-skills <skill> [options]              Install a skill
  ai-skills install <skill> [options]      Install a skill
  ai-skills list [--json]        List installed and available skills
  ai-skills remove <skill> [options]   Remove an installed skill
  ai-skills update [--force]     Update all installed skills
                  [--skill <name>]   Update a specific skill
  ai-skills generate-local [skill]    Run local backend generator

Install options:
  --local                         Install in current project (.ai-skills/skills)
  --global                        Install in home agent folders
  --all                           Install to all global platforms
  --platform <a,b,c>              Install to selected global platforms

Remove options:
  --local                         Remove from current project platforms
  --global                        Remove from home agent platforms
  --all                           Remove from all platforms for selected scope
  --platform <a,b,c>              Remove from selected platforms for selected scope

Examples:
  ai-skills react
  ai-skills react --local
  ai-skills react --platform claude,gemini,opencode,vscode,codex,agents
  ai-skills install typescript
  ai-skills list
  ai-skills remove python
  ai-skills update --force
  ai-skills update --skill react
  ai-skills generate-local
  ai-skills generate-local react
  `);
}
