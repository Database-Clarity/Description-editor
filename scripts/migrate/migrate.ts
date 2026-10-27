import { copyFile, mkdir, readdir, readFile, unlink, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  contentHash,
  migrateLegacy,
  permissionsSchema,
  stableStringify,
  type Permissions,
  type Pushed,
  type Tooltip,
} from '@clarity/core';

export function formatJson(value: unknown): string {
  return `${JSON.stringify(JSON.parse(stableStringify(value)), null, 2)}\n`;
}

export async function prepareMigration(intermediate: unknown, live: unknown, owner: unknown) {
  const permissions = permissionsSchema.parse(owner);
  const tooltips = migrateLegacy(intermediate).sort((a, b) => a.hash - b.hash);
  const liveTooltips = migrateLegacy(live);
  const pushed: Pushed = Object.fromEntries(
    await Promise.all(
      liveTooltips.map(async (tooltip) => [tooltip.hash, await contentHash(tooltip)]),
    ),
  );
  const hashes = await Promise.all(tooltips.map(contentHash));
  const pending = tooltips.filter(
    (tooltip, index) => hashes[index] !== pushed[tooltip.hash],
  ).length;
  return { tooltips, pushed, permissions, pending, liveCount: liveTooltips.length };
}

export async function writeMigration(
  output: string,
  data: { tooltips: Tooltip[]; pushed: Pushed; permissions: Permissions },
) {
  const root = resolve(output);
  const tooltipDirectory = join(root, 'tooltips');
  await mkdir(tooltipDirectory, { recursive: true });
  const expected = new Set(data.tooltips.map(({ hash }) => `${hash}.json`));
  const entries = await readdir(tooltipDirectory, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isFile() || !/^(0|[1-9]\d*)\.json$/.test(entry.name)) {
      throw new Error(
        `Unexpected entry in migration output: ${join(tooltipDirectory, entry.name)}`,
      );
    }
  }
  for (const tooltip of data.tooltips) {
    await writeFile(join(tooltipDirectory, `${tooltip.hash}.json`), formatJson(tooltip));
  }
  for (const entry of entries) {
    if (!expected.has(entry.name)) await unlink(join(tooltipDirectory, entry.name));
  }
  for (const [file, value] of [
    ['config/permissions.json', data.permissions],
    ['live/pushed.json', data.pushed],
  ] as const) {
    const target = join(root, file);
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, formatJson(value));
  }
  const template = fileURLToPath(new URL('./template/', import.meta.url));
  for (const file of ['README.md', '.github/workflows/bundle.yml', 'scripts/build-bundle.mjs']) {
    const target = join(root, file);
    await mkdir(dirname(target), { recursive: true });
    await copyFile(join(template, file), target);
  }
}

export async function readJson(path: string): Promise<unknown> {
  return JSON.parse(await readFile(path, 'utf8'));
}
