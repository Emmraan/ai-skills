/* eslint-disable no-console */

export function log(message: string) {
  console.log(message);
}

export function info(message: string) {
  console.log(`ℹ ${message}`);
}

export function success(message: string) {
  console.log(`✓ ${message}`);
}

export function error(message: string) {
  console.error(`✗ ${message}`);
}

export function warn(message: string) {
  console.warn(`⚠ ${message}`);
}
