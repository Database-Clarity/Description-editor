import { z } from 'zod';
import { hashSchema } from './legacy.js';

export const aliasesSchema = z.record(
  z
    .string()
    .regex(/^(0|[1-9]\d*)$/)
    .refine((value) => Number(value) <= 0xffffffff),
  z.object({ to: hashSchema, kind: z.enum(['sandbox', 'frame']) }).strict(),
);
export type Aliases = z.infer<typeof aliasesSchema>;

export function resolveAlias(hash: number, aliases: Aliases): number {
  const seen = new Set<number>();
  while (aliases[hash]) {
    if (seen.has(hash)) throw new Error(`Cyclic tooltip alias at ${hash}`);
    seen.add(hash);
    hash = aliases[hash].to;
  }
  return hash;
}
