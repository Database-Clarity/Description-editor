import { z } from 'zod';
import { hashSchema, type LegacyCatalog } from '@clarity/core';
import { HttpError, upstreamJson } from './http.js';
import type { Env } from './types.js';

const itemSchema = z.object({
  hash: hashSchema,
  name: z.string(),
  categoryId: z.string(),
  itemHash: hashSchema.optional(),
  itemName: z.string().optional(),
});
const itemsSchema = z.record(z.string(), itemSchema);
const categoriesSchema = z.array(
  z.object({
    id: z.string(),
    legacyType: z.string().optional(),
  }),
);
const aliasesSchema = z.record(
  z
    .string()
    .regex(/^(0|[1-9]\d*)$/)
    .refine((value) => Number(value) <= 0xffffffff),
  hashSchema,
);

export async function catalog(env: Env): Promise<{
  facts: LegacyCatalog;
  aliases: Record<string, number>;
}> {
  const root =
    `https://raw.githubusercontent.com/${encodeURIComponent(env.GENERATOR_OWNER)}/` +
    `${encodeURIComponent(env.GENERATOR_REPO)}/${encodeURIComponent(env.GENERATOR_BRANCH)}/templates/v2`;
  const [items, categories, aliases] = await Promise.all([
    fetch(`${root}/items.json`)
      .then(upstreamJson)
      .then((value) => itemsSchema.parse(value)),
    fetch(`${root}/categories.json`)
      .then(upstreamJson)
      .then((value) => categoriesSchema.parse(value)),
    fetch(`${root}/sandboxAliases.json`)
      .then(upstreamJson)
      .then((value) => aliasesSchema.parse(value)),
  ]);
  const categoriesById = new Map(categories.map((category) => [category.id, category]));
  const facts: LegacyCatalog = {};
  for (const [hash, item] of Object.entries(items)) {
    if (Number(hash) !== item.hash) throw new HttpError(502, 'Generator item hash mismatch');
    const category = categoriesById.get(item.categoryId);
    if (!category) throw new HttpError(502, `Generator category is missing: ${item.categoryId}`);
    facts[hash] = {
      name: item.name,
      type: category.legacyType ?? category.id,
      ...(item.itemHash === undefined ? {} : { itemHash: item.itemHash }),
      ...(item.itemName === undefined ? {} : { itemName: item.itemName }),
    };
  }
  return { facts, aliases };
}
