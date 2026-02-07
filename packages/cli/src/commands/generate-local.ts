import { spawn } from 'child_process';
import { resolve } from 'path';
import { error, info, success } from '../utils/logger.js';

export async function generateLocal(skill?: string): Promise<boolean> {
  const backendDir = resolve(process.cwd(), 'backend');
  const command = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
  const args = ['run', 'generate'];

  if (skill) {
    args.push('--', '--skill', skill);
  }

  info(`Running local generator in ${backendDir}...`);

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
      if (code === 0) {
        success('Local generation completed successfully');
        resolvePromise(true);
      } else {
        error(`Local generation failed with exit code ${code ?? -1}`);
        resolvePromise(false);
      }
    });
  });
}
