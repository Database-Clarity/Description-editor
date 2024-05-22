import { sql } from '$lib/server/squeal'
import { languageCodes, type LanguageCode, type PerkTypes } from '$lib/types'

export type Perk = {
  hash: number
  name: string
  type: PerkTypes
}

export const load = async ({ url }) => {
  const langParam = url.searchParams.get('lang')
  const lang = languageCodes.includes(langParam as LanguageCode) ? (langParam as LanguageCode) : 'en'

  const perksPromise = sql<Perk[]>`
    SELECT "hash", ${sql('name_' + lang)} as "name", type
    FROM perk
    ORDER BY ${sql('name_' + lang)} ASC`

  return { perksPromise, lang }
}
