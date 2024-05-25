import { languageCodes, type LanguageCode } from '$lib/types'
import { sql } from '$lib/server/squeal'

type Description = {
  description: string
  username: string
  live: boolean
  ready: boolean
  timestamp: number
}
type Comments = {
  username: string
  timestamp: number
  text: string
}

export const load = async ({ url, params }) => {
  const hashParam = Number(params.hash)
  const langParam = url.searchParams.get('lang') as LanguageCode
  const timestampParam = Number(url.searchParams.get('timestamp'))
  const editorParam = url.searchParams.get('editor')

  const hash = isNaN(hashParam) ? 0 : hashParam
  const lang = languageCodes.includes(langParam) ? langParam : languageCodes[0]
  const timestamp = isNaN(timestampParam) ? 0 : timestampParam
  const editor = ['single', 'dual'].includes(editorParam || '') ? editorParam : 'single'

  const descriptionPromise = sql<Description[]>`
    SELECT "description", "username", "live", "ready", "timestamp"
    FROM ${sql(lang)}
    WHERE "hash" = ${hash}
    AND timestamp = (
      SELECT MAX(timestamp)
      FROM ${sql(lang)}
      WHERE hash = ${hash}
    )`

  const comments = sql<Comments[]>`
    SELECT "username", "timestamp", "text"
    FROM comment
    WHERE "hash" = ${hash}`

  return { descriptionPromise, comments, hash, editor, test: 'test' }
}
