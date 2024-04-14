import { squeal } from '$lib/server/squeal'
import { languageCodes, type LanguageCode, type PerkTypes } from '$lib/types'
import { env } from '$env/dynamic/private'
import type postgres from 'postgres'
import type { PendingQuery } from './[hash]/+page.server'

export type Perk = {
  hash: number
  name: string
  type: PerkTypes
}

export const load = async ({ url }) => {
  // const langParam = url.searchParams.get('lang')

  // // const hash = isNaN(hashParam) ? 0 : hashParam
  // const lang = languageCodes.includes(langParam as LanguageCode) ? (langParam as LanguageCode) : 'en'

  // const sql = squeal(env, true)

  // const perks = sql<Perk[]>`
  //   SELECT "hash", ${sql('name_' + lang)} as "name", type
  //   FROM perk
  //   ORDER BY ${sql('name_' + lang)} ASC`

  return {
    perks: [
      { hash: 1, name: 'Perk 1', type: 'perk' },
      { hash: 2, name: 'Perk 2', type: 'perk' },
      { hash: 3, name: 'Perk 3', type: 'perk' },
      { hash: 4, name: 'Perk 4', type: 'perk' },
    ] as any as PendingQuery<Perk[]>,
    lang: 'en' as const,
  } // { perks, lang }
}
