import { z } from 'zod';

export const languages = [
  'en', 'de', 'es', 'es-mx', 'fr', 'it', 'ja', 'ko', 'pl',
  'pt-br', 'ru', 'zh-chs', 'zh-cht',
] as const;
export const langSchema = z.enum(languages);
export type Lang = z.infer<typeof langSchema>;
