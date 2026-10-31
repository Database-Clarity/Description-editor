import { stableStringify } from './contentHash.js';
import { tooltipSchema, type Tooltip } from './schemas.js';

export async function publishableHash(tooltip: Tooltip): Promise<string> {
  const parsed = tooltipSchema.parse(tooltip);
  const bytes = new TextEncoder().encode(
    stableStringify({
      text: Object.fromEntries(
        Object.entries(parsed.text).map(([language, value]) => [language, value.text]),
      ),
      associated: parsed.associated,
      custom: parsed.custom,
    }),
  );
  const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}
