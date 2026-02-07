import { install } from './commands/install.js';
import { remove } from './commands/remove.js';
import { list } from './commands/list.js';
import { update } from './commands/update.js';
import { error, info } from './utils/logger.js';

const args = process.argv.slice(2);

export async function main(): Promise<void> {
  if (args.length === 0) {
    showHelp();
    return;
  }

  const command = args[0];

  try {
    if (command === 'install' && args.length >= 2) {
      const skill = args[1];
      const success = await install(skill);
      process.exit(success ? 0 : 1);
    } else if (command === 'remove' && args.length >= 2) {
      const skill = args[1];
      const success = await remove(skill);
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
    } else if (!command.startsWith('-')) {
      // Default behavior: treat first arg as skill name to install
      const success = await install(command);
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
  ai-skills <skill>              Install a skill
  ai-skills install <skill>      Install a skill
  ai-skills list [--json]        List installed and available skills
  ai-skills remove <skill>       Remove an installed skill
  ai-skills update [--force]     Update all installed skills
                  [--skill <name>]   Update a specific skill

Examples:
  ai-skills react
  ai-skills install typescript
  ai-skills list
  ai-skills remove python
  ai-skills update --force
  ai-skills update --skill react
  `);
}
