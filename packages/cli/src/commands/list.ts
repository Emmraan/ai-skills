import { getAvailableSkills } from '../core/downloader.js';
import { getInstalledSkills } from '../core/lockfile.js';
import { log } from '../utils/logger.js';
import chalk from 'chalk';
import pc from 'picocolors';

export async function list(json: boolean = false): Promise<void> {
  const installedSkills = await getInstalledSkills();
  const availableSkills = await getAvailableSkills();

  const installed = installedSkills.map((s) => s.name);

  if (json) {
    const output = {
      installed,
      available: availableSkills,
      summary: {
        installedCount: installed.length,
        availableCount: availableSkills.length,
      },
    };
    log(JSON.stringify(output, null, 2));
  } else {
    log('');

    // Calculate max width needed
    const maxSkillLength = Math.max(
      ...installed.map((s) => s.length),
      ...availableSkills.map((s) => s.length),
      10
    );
    const boxWidth = maxSkillLength + 20;

    // Helper function to pad content to box width
    const padLine = (content: string): string => {
      // eslint-disable-next-line no-control-regex
      const stripped = content.replace(
        // eslint-disable-next-line no-control-regex
        /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcm]/g,
        ''
      );
      const strippedLength = stripped.length;
      const padding = boxWidth - 2 - strippedLength;
      return padding > 0 ? content + ' '.repeat(padding) : content;
    };

    // Calculate border dimensions
    const titlePart = '─ AI Skills Status '; // 19 characters
    const middleDashesCount = Math.max(boxWidth - titlePart.length - 2, 1);

    // Top border with title - use enhanced picocolors
    log(pc.cyan(`┌${titlePart}${pc.gray('─'.repeat(middleDashesCount))}┐`));

    // Installed Skills Section
    log(pc.cyan('│') + padLine('') + pc.cyan('│'));
    log(pc.cyan('│') + padLine('  📦 Installed Skills') + pc.cyan('│'));
    log(
      pc.cyan('│') + padLine(`  ${pc.gray('─'.repeat(Math.max(boxWidth - 8, 1)))}`) + pc.cyan('│')
    );

    if (installed.length > 0) {
      installedSkills.forEach((entry) => {
        const version = chalk.gray(`v${entry.version}`);
        const line = `  ${chalk.green('✓')} ${entry.name.padEnd(20)} ${version}`;
        log(pc.cyan('│') + padLine(line) + pc.cyan('│'));
      });
    } else {
      log(pc.cyan('│') + padLine('  ' + chalk.gray('(none installed yet)')) + pc.cyan('│'));
    }

    // Available Skills Section
    log(pc.cyan('│') + padLine('') + pc.cyan('│'));
    log(pc.cyan('│') + padLine('  🌐 Available Skills') + pc.cyan('│'));
    log(
      pc.cyan('│') + padLine(`  ${pc.gray('─'.repeat(Math.max(boxWidth - 8, 1)))}`) + pc.cyan('│')
    );

    availableSkills.forEach((name) => {
      const isInstalled = installed.includes(name);
      const line = isInstalled
        ? `  ${chalk.dim(name.padEnd(20))} ${chalk.gray('[installed]')}`
        : `  ${chalk.yellow('○')} ${name}`;
      log(pc.cyan('│') + padLine(line) + pc.cyan('│'));
    });

    log(pc.cyan('│') + padLine('') + pc.cyan('│'));

    // Bottom border
    log(pc.cyan(`└${pc.gray('─'.repeat(boxWidth - 2))}┘`));
    log('');

    // Summary with enhanced visual style
    const totalInstalled = installed.length;
    const totalAvailable = availableSkills.length;
    const notInstalled = totalAvailable - totalInstalled;

    log(chalk.bold.cyan('─ Summary'));
    log(`  ${pc.green('✓')} Installed: ${chalk.bold(totalInstalled.toString())} skill(s)`);
    log(`  ${pc.yellow('○')} Available: ${chalk.bold(totalAvailable.toString())} skill(s)`);
    log(`  ${pc.cyan('➜')} Not installed: ${chalk.bold(notInstalled.toString())} skill(s)`);
    log('');

    if (notInstalled > 0) {
      log(
        pc.gray(`💡 Tip: Use ${chalk.cyan('npx @emmraan/ai-skills <skill>')} to install a skill`)
      );
      log('');
    }
  }
}
