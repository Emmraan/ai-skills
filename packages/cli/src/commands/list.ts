import { getAvailableSkills } from '../core/downloader.js';
import { getInstalledSkills } from '../core/lockfile.js';
import { log } from '../utils/logger.js';

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
    log('\n📦 Installed Skills:');
    if (installed.length === 0) {
      log('  (none)');
    } else {
      installed.forEach((name) => {
        const entry = installedSkills.find((s) => s.name === name);
        log(`  • ${name} (v${entry?.version || 'unknown'})`);
      });
    }

    log('\n🌐 Available Skills:');
    availableSkills.forEach((name) => {
      const isInstalled = installed.includes(name);
      const status = isInstalled ? ' [installed]' : '';
      log(`  • ${name}${status}`);
    });

    log(`\nTotal: ${installed.length} installed, ${availableSkills.length} available\n`);
  }
}
