import { appendFile, readdir, readFile, unlink, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { aliasesSchema, pushedSchema, tooltipSchema } from '@clarity/core';
import { z } from 'zod';
import { conflictNotes, foldFrames } from './foldFrames.js';
import { formatJson, readJson } from './migrate.js';

const { values } = parseArgs({
  options: {
    data: { type: 'string' },
    aliases: { type: 'string' },
    items: { type: 'string' },
    conflicts: { type: 'string' },
    write: { type: 'boolean', default: false },
  },
});
if (!values.data || !values.aliases || !values.items || !values.conflicts) {
  throw new Error(
    'Required: --data <checkout> --aliases <json> --items <json> --conflicts <md> [--write]',
  );
}
const root = resolve(values.data);
const directory = join(root, 'tooltips');
const files = await readdir(directory);
if (files.some((file) => !/^(0|[1-9]\d*)\.json$/.test(file))) {
  throw new Error('Unexpected non-tooltip file in tooltips directory');
}
const tooltips = await Promise.all(
  files.map(async (file) => {
    const tooltip = tooltipSchema.parse(JSON.parse(await readFile(join(directory, file), 'utf8')));
    if (file !== `${tooltip.hash}.json`) throw new Error(`Stored tooltip hash mismatch: ${file}`);
    return tooltip;
  }),
);
const result = foldFrames(
  tooltips,
  aliasesSchema.parse(await readJson(values.aliases)),
  pushedSchema.parse(await readJson(join(root, 'live', 'pushed.json'))),
  z.record(z.string(), z.object({ name: z.string() })).parse(await readJson(values.items)),
);
console.log(
  JSON.stringify(
    {
      mode: values.write ? 'write' : 'dry run',
      before: tooltips.length,
      after: result.tooltips.length,
      folded: result.folded,
      replacedLanguageVersions: result.conflicts.length,
    },
    null,
    2,
  ),
);
if (values.write) {
  // Archive replaced text before deleting any authored file.
  await appendFile(resolve(values.conflicts), conflictNotes(result.conflicts));
  for (const tooltip of result.tooltips) {
    const path = join(directory, `${tooltip.hash}.json`);
    const next = formatJson(tooltip);
    if (!files.includes(`${tooltip.hash}.json`) || (await readFile(path, 'utf8')) !== next) {
      await writeFile(path, next);
    }
  }
  await writeFile(join(root, 'live', 'pushed.json'), formatJson(result.pushed));
  for (const hash of result.folded) await unlink(join(directory, `${hash}.json`));
}
