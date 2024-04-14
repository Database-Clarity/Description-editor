import { squeal } from '$lib/server/squeal'
import { languageCodes, type LanguageCode, type PerkTypes } from '$lib/types'
import { env } from '$env/dynamic/private'
import type postgres from 'postgres'

export type Perk = {
  hash: number
  name: string
  type: PerkTypes
}
// type Description = {
//   description: string
//   username: string
//   live: boolean
//   ready: boolean
//   timestamp: number
// }
// type Comments = {
//   username: string
//   timestamp: number
//   text: string
// }

// export const load = async ({ url, params }) => {
//   const hashParam = Number(params.hash)
//   const langParam = url.searchParams.get('lang')
//   const timestampParam = Number(url.searchParams.get('timestamp'))
//   const editorParam = url.searchParams.get('editor')

//   const hash = isNaN(hashParam) ? 0 : hashParam
//   const lang = languageCodes.includes(langParam as LanguageCode) ? (langParam as LanguageCode) : 'en'
//   const timestamp = isNaN(timestampParam) ? 0 : timestampParam
//   const editor = ['single', 'dual'].includes(editorParam || '') ? editorParam : 'single'

//   const sql = squeal(env, true)

//   const perks = sql<Perk[]>`
//     SELECT "hash", ${sql('name_' + lang)} as "name", type
//     FROM perk
//     ORDER BY ${sql('name_' + lang)} ASC`

//   const description = sql<Description[]>`
//     SELECT "description", "username", "live", "ready", "timestamp"
//     FROM ${sql(lang)}
//     WHERE "hash" = ${hash} AND "timestamp" = ${timestamp}`

//   const comments = sql<Comments[]>`
//     SELECT "username", "timestamp", "text"
//     FROM comment
//     WHERE "hash" = ${hash}`

//   return { perks, description, comments, hash, lang, editor }
// }

// // It has to be here because I can't import postgres or any part of it even types to svelte files
export type PendingQuery<T extends postgres.MaybeRow[]> = postgres.PendingQuery<T>
