import { parseCsv } from './csv.js';
import { HttpError, json } from './http.js';
import type { Context } from './types.js';

export async function compendium(tab: string, context: Context): Promise<Response> {
  if (!tab.trim() || tab.length > 200) throw new HttpError(400, 'Invalid Compendium tab');
  const url = new URL(
    'https://docs.google.com/spreadsheets/d/1WaxvbLx7UoSZaBqdFr1u32F2uWVLo-CJunJB4nlGUE4/gviz/tq',
  );
  url.searchParams.set('tqx', 'out:csv');
  url.searchParams.set('sheet', tab);
  const key = new Request(
    `https://clarity-cache.invalid/compendium?tab=${encodeURIComponent(tab)}`,
  );
  const cache = await caches.open('clarity-compendium-v1');
  const cached = await cache.match(key);
  if (cached) return cached;
  const response = await fetch(url);
  if (!response.ok) throw new HttpError(502, `Compendium fetch failed (${response.status})`);
  const contentType = response.headers.get('Content-Type') ?? '';
  if (!/text\/(csv|plain)|application\/(csv|octet-stream)/i.test(contentType)) {
    throw new HttpError(502, 'Compendium did not return CSV');
  }
  const result = json({ rows: parseCsv(await response.text()) });
  result.headers.set('Cache-Control', 'public, max-age=900');
  context.waitUntil(
    cache.put(key, result.clone()).catch((error: unknown) => {
      console.error(
        'Compendium cache write failed',
        error instanceof Error ? error.message : 'Unknown error',
      );
    }),
  );
  return result;
}
