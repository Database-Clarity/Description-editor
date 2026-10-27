import { z } from 'zod';

export const compendiumStyleSchema = z
  .object({
    color: z
      .string()
      .regex(/^#[0-9a-f]{6}(?:[0-9a-f]{2})?$/)
      .optional(),
    bold: z.literal(true).optional(),
    italic: z.literal(true).optional(),
    underline: z.literal(true).optional(),
    strike: z.literal(true).optional(),
    sizePt: z.number().positive().max(200).optional(),
    href: z
      .string()
      .url()
      .refine((value) => /^(https?:|mailto:)/.test(value))
      .optional(),
  })
  .strict();
export const compendiumRunSchema = compendiumStyleSchema.extend({ text: z.string() });
export const compendiumCellSchema = z
  .object({
    plain: z.string(),
    runs: z.array(compendiumRunSchema),
  })
  .strict()
  .refine(
    (cell) => cell.runs.map((run) => run.text).join('') === cell.plain,
    'Compendium plain text must match its runs',
  );
export const compendiumTabSchema = z.object({ gid: z.string().regex(/^-?\d+$/), name: z.string() });
export const compendiumRowSchema = z.object({
  name: z.string(),
  nameNorm: z.string(),
  section: z.string().optional(),
  rowIndex: z.number().int().positive(),
  cell: compendiumCellSchema,
});
export const compendiumSheetSchema = z.object({
  gid: z.string().regex(/^-?\d+$/),
  name: z.string(),
  rows: z.array(compendiumRowSchema),
});
export const compendiumDataSchema = z.object({
  fetchedAt: z.string().datetime({ offset: true }),
  tabs: z.array(compendiumSheetSchema),
});
export const compendiumLinkSchema = z
  .object({
    gid: z.string().regex(/^-?\d+$/),
    rowKey: z.string().min(1),
    section: z.string().optional(),
    snapshot: compendiumCellSchema,
    snapshotAt: z.string().datetime({ offset: true }),
  })
  .strict();
export type CompendiumStyle = z.infer<typeof compendiumStyleSchema>;
export type CompendiumRun = z.infer<typeof compendiumRunSchema>;
export type CompendiumCell = z.infer<typeof compendiumCellSchema>;
export type CompendiumTab = z.infer<typeof compendiumTabSchema>;
export type CompendiumRow = z.infer<typeof compendiumRowSchema>;
export type CompendiumSheet = z.infer<typeof compendiumSheetSchema>;
export type CompendiumData = z.infer<typeof compendiumDataSchema>;
export type CompendiumLink = z.infer<typeof compendiumLinkSchema>;

export function styleKey(run: CompendiumRun): string {
  return JSON.stringify(
    Object.entries(run)
      .filter(([key]) => key !== 'text')
      .sort(([a], [b]) => a.localeCompare(b)),
  );
}

export function normaliseRuns(runs: CompendiumRun[]): CompendiumCell {
  const merged: CompendiumRun[] = [];
  for (const run of runs) {
    if (!run.text) continue;
    const last = merged.at(-1);
    if (last && styleKey(last) === styleKey(run)) last.text += run.text;
    else merged.push({ ...run });
  }
  return { plain: merged.map((run) => run.text).join(''), runs: merged };
}

export function sameCell(a: CompendiumCell, b: CompendiumCell): boolean {
  const left = normaliseRuns(a.runs);
  const right = normaliseRuns(b.runs);
  return (
    left.plain === right.plain &&
    left.runs.length === right.runs.length &&
    left.runs.every(
      (run, i) => run.text === right.runs[i].text && styleKey(run) === styleKey(right.runs[i]),
    )
  );
}
