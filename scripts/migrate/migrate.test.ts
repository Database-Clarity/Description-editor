import { execFileSync } from 'node:child_process';
import { mkdtemp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';
import {
  contentHash,
  migrateLegacy,
  permissionsSchema,
  pushedSchema,
  tooltipSchema,
} from '@clarity/core';
import { formatJson, prepareMigration, readJson, writeMigration } from './migrate.js';
import { buildBundle } from './template/scripts/build-bundle.mjs';

const owner = { users: { '117818418': { login: 'StardustD2', role: 'maintainer' } } };
const sourceCommit = 'a'.repeat(40);
const directories: string[] = [];

function database(text: string, hash = 42) {
  return {
    perks: {
      [hash]: {
        hash,
        name: 'Example',
        type: 'weaponPerk',
        editor: { en: { main: text, secondary: 'discarded' } },
        uploadedBy: 'original author',
        lastUpload: 1000,
        updateTracker: { descriptions: { en: { lastUpdate: 2000, updatedBy: 'translator' } } },
      },
    },
    databaseSettings: { folders: {}, enhancedPerks: {} },
  };
}

async function temporaryDirectory() {
  const directory = await mkdtemp(join(tmpdir(), 'clarity-migration-'));
  directories.push(directory);
  return directory;
}

afterEach(async () => {
  await Promise.all(directories.splice(0).map((directory) => rm(directory, { recursive: true })));
});

describe('migration', () => {
  it('uses the migrated live baseline and reports full content-hash differences', async () => {
    const intermediate = database('draft');
    const live = database('published');
    const result = await prepareMigration(intermediate, live, owner);
    expect(result.pending).toBe(1);
    expect(result.liveCount).toBe(1);
    expect(result.pushed['42']).toBe(await contentHash(migrateLegacy(live)[0]));
    expect(result.pushed['42']).not.toBe(await contentHash(result.tooltips[0]));
    expect(result.tooltips[0].text.en).toEqual({
      text: 'draft',
      updatedAt: '1970-01-01T00:00:02.000Z',
      updatedBy: 'translator',
    });
    expect((await prepareMigration(live, live, owner)).pending).toBe(0);
    const metadataOnly = database('published');
    metadataOnly.perks[42].lastUpload = 3000;
    expect((await prepareMigration(metadataOnly, live, owner)).pending).toBe(1);
  });

  it('retains live-only baselines, detects new tooltips, and validates input', async () => {
    const result = await prepareMigration(database('new', 43), database('old'), owner);
    expect(result.pending).toBe(1);
    expect(Object.keys(result.pushed)).toEqual(['42']);
    await expect(prepareMigration({}, database('x'), owner)).rejects.toThrow();
    await expect(
      prepareMigration(database('x'), database('x'), { users: { bad: {} } }),
    ).rejects.toThrow();
  });

  it('writes stable 2-space newline JSON and is byte-identical on rerun', async () => {
    const root = await temporaryDirectory();
    const result = await prepareMigration(database('draft', 2), database('live', 2), owner);
    await writeMigration(root, result);
    const path = join(root, 'tooltips', '2.json');
    const first = await readFile(path, 'utf8');
    expect(first).toBe(formatJson(result.tooltips[0]));
    expect(first).toContain('\n  "associated": [],\n  "custom": {');
    expect(first.endsWith('\n')).toBe(true);
    expect(tooltipSchema.parse(JSON.parse(first)).custom?.name).toBe('Example');
    expect(
      permissionsSchema.parse(await readJson(join(root, 'config', 'permissions.json'))),
    ).toEqual(owner);
    expect(pushedSchema.parse(await readJson(join(root, 'live', 'pushed.json')))).toEqual(
      result.pushed,
    );
    await writeFile(join(root, 'tooltips', '123.json'), '{}');
    await writeFile(join(root, 'keep.txt'), 'untouched');
    await writeMigration(root, result);
    expect(await readFile(path, 'utf8')).toBe(first);
    expect(await readdir(join(root, 'tooltips'))).toEqual(['2.json']);
    expect(await readFile(join(root, 'keep.txt'), 'utf8')).toBe('untouched');
    expect(await readFile(join(root, '.github', 'workflows', 'bundle.yml'), 'utf8')).toContain(
      'HEAD:refs/heads/editor-data-bundle',
    );
  });

  it('rejects unexpected output entries instead of deleting them', async () => {
    const root = await temporaryDirectory();
    await mkdir(join(root, 'tooltips'));
    await writeFile(join(root, 'tooltips', 'notes.txt'), 'preserve');
    const result = await prepareMigration(database('draft'), database('live'), owner);
    await expect(writeMigration(root, result)).rejects.toThrow('Unexpected entry');
    expect(await readFile(join(root, 'tooltips', 'notes.txt'), 'utf8')).toBe('preserve');
  });
});

describe('dependency-free bundle', () => {
  it('builds the exact public shape and runs using only Node', async () => {
    const root = await temporaryDirectory();
    const result = await prepareMigration(database('draft'), database('live'), owner);
    await writeMigration(root, result);
    const generatedAt = '2026-10-27T00:00:00.000Z';
    const bundle = await buildBundle(root, sourceCommit, generatedAt);
    expect(bundle).toEqual({
      sourceCommit,
      generatedAt,
      tooltips: { '42': result.tooltips[0] },
      permissions: owner,
      pushed: result.pushed,
    });
    const output = join(root, 'publish', 'bundle.json');
    const script = fileURLToPath(new URL('./template/scripts/build-bundle.mjs', import.meta.url));
    const stdout = execFileSync(process.execPath, [script, output], {
      cwd: root,
      env: { ...process.env, GITHUB_SHA: sourceCommit },
      encoding: 'utf8',
    });
    expect(stdout).toContain('Bundled 1 tooltips');
    expect(JSON.parse(await readFile(output, 'utf8'))).toMatchObject(
      JSON.parse(
        formatJson({
          sourceCommit,
          tooltips: { '42': result.tooltips[0] },
          permissions: owner,
          pushed: result.pushed,
        }),
      ),
    );
    expect(await readdir(join(root, 'publish'))).toEqual(['bundle.json']);
  });

  it('fails on invalid commit, mismatched hash, missing data or bad pushed digest', async () => {
    const root = await temporaryDirectory();
    await expect(buildBundle(root, 'main')).rejects.toThrow('full source commit');
    await expect(buildBundle(root, sourceCommit)).rejects.toThrow();
    await writeMigration(root, await prepareMigration(database('draft'), database('live'), owner));
    await writeFile(join(root, 'tooltips', '42.json'), '{"hash":43}');
    await expect(buildBundle(root, sourceCommit)).rejects.toThrow('does not match');
    await writeMigration(root, await prepareMigration(database('draft'), database('live'), owner));
    await writeFile(join(root, 'live', 'pushed.json'), '{"42":"bad"}');
    await expect(buildBundle(root, sourceCommit)).rejects.toThrow('Invalid pushed entry');
  });
});
