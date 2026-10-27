import { permissionsSchema, pushedSchema, tooltipSchema } from '@clarity/core';
import { z } from 'zod';
import { fetchJson } from './http';

export const bundleSchema = z.object({
  sourceCommit: z.string().min(1),
  generatedAt: z.string().datetime({ offset: true }),
  tooltips: z
    .record(z.string(), tooltipSchema)
    .refine(
      (tooltips) => Object.entries(tooltips).every(([key, value]) => key === String(value.hash)),
      'Tooltip keys must match their hashes',
    ),
  permissions: permissionsSchema,
  pushed: pushedSchema,
});
export type Bundle = z.infer<typeof bundleSchema>;
export const bundleUrl =
  'https://raw.githubusercontent.com/Database-Clarity/Live-Clarity-Database/editor-data-bundle/bundle.json';

export function loadBundle(signal?: AbortSignal): Promise<Bundle> {
  return fetchJson(bundleUrl, bundleSchema, { signal, cache: 'no-cache' });
}
