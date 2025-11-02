import packageJson from '../../package.json';

export const APP_VERSION = packageJson.version;
export const APP_NAME = packageJson.name;

export function getVersionString(): string {
  return `v${APP_VERSION}`;
}
