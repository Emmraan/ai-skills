import { spawn } from 'child_process';
import { resolve } from 'path';
import { error, info, section, highlight } from '../utils/logger.js';
import pc from 'picocolors';

export async function generateLocal(skill?: string): Promise<boolean> {
  const backendDir = resolve(process.cwd(), 'backend');
  const command = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
  const args = ['run', 'generate'];

  if (skill) {
    args.push('--', '--skill', skill);
  }

  section(`Running Local Generator`);
  // eslint-disable-next-line no-console
  console.log('');
  info(`Backend directory: ${pc.cyan(backendDir)}`);
  if (skill) {
    info(`Skill: ${pc.cyan(skill)}`);
  }
  // eslint-disable-next-line no-console
  console.log('');

  return new Promise((resolvePromise) => {
    const child = spawn(command, args, {
      cwd: backendDir,
      stdio: 'inherit',
      shell: false,
    });

    child.on('error', (err) => {
      error(`Failed to start local generator: ${err.message}`);
      resolvePromise(false);
    });

    child.on('exit', (code) => {
      // eslint-disable-next-line no-console
      console.log('');
      if (code === 0) {
        highlight('✨ Local generation completed successfully');
        // eslint-disable-next-line no-console
        console.log('');
        resolvePromise(true);
      } else {
        error(`Local generation failed with exit code ${code ?? -1}`);
        // eslint-disable-next-line no-console
        console.log('');
        resolvePromise(false);
      }
    });
  });
}
