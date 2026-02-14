import { fetchRegistryIndex } from '../core/downloader.js';
import { log, warn } from '../utils/logger.js';
import { ui } from '../utils/ui.js';
import chalk from 'chalk';

export interface SearchOptions {
  json?: boolean;
  domain?: string;
}

interface SearchResult {
  name: string;
  version: string;
  domains: string[];
  lastGenerated: string;
}

function parseSearchFlags(args: string[]): SearchOptions {
  const options: SearchOptions = { json: false };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--json') {
      options.json = true;
    } else if (args[i] === '--domain' && args[i + 1]) {
      options.domain = args[i + 1];
      i++;
    }
  }

  return options;
}

function matchesQuery(skillName: string, domains: string[], query: string): boolean {
  const lowerQuery = query.toLowerCase();

  // Match on skill name
  if (skillName.toLowerCase().includes(lowerQuery)) {
    return true;
  }

  // Match on domains
  if (domains.some((domain) => domain.toLowerCase().includes(lowerQuery))) {
    return true;
  }

  return false;
}

export async function search(query: string, options: SearchOptions = {}): Promise<void> {
  const flags = parseSearchFlags([]);
  const mergedOptions = { ...flags, ...options };

  const index = await fetchRegistryIndex();
  const skillNames = Object.keys(index.skills);

  // Filter by query
  let results: SearchResult[] = skillNames
    .filter((name) => matchesQuery(name, index.skills[name].domains, query))
    .map((name) => ({
      name,
      version: index.skills[name].version,
      domains: index.skills[name].domains,
      lastGenerated: index.skills[name].lastGenerated,
    }));

  // Filter by domain if provided
  if (mergedOptions.domain) {
    results = results.filter((skill) => skill.domains.includes(mergedOptions.domain!));
  }

  // Output
  if (mergedOptions.json) {
    log(JSON.stringify(results, null, 2));
  } else {
    if (results.length === 0) {
      warn(
        `No skills found matching "${query}"${mergedOptions.domain ? ` in domain "${mergedOptions.domain}"` : ''}`
      );
    } else {
      const formattedResults = results.map((r) => {
        const domainStr = r.domains.length > 0 ? chalk.gray(` [${r.domains.join(', ')}]`) : '';
        return `${chalk.cyan(r.name)}${chalk.gray(` v${r.version}`)}${domainStr}`;
      });

      ui.printBox(formattedResults, '🔍 Search Results');

      log('');
      log(chalk.gray(`💡 Tip: Use ${chalk.cyan('ai-skills install <skill>')} to install a skill`));
      log('');
    }
  }
}

export { parseSearchFlags };
