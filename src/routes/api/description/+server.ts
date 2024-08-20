import type { RequestHandler } from './$types'
import { sql } from '$lib/server/squeal'
import { languageCodes, type LanguageCode } from '$lib/types'
import { trimEmptyDivElements } from '$lib/utils'

type Description = {
  description: string
  username: string
  live: boolean
  ready: boolean
  timestamp: number
}

export const GET: RequestHandler = async ({ url }) => {
  const hash = url.searchParams.get('hash')
  const lang = (url.searchParams.get('lang') as LanguageCode) || 'en'

  if (!hash) {
    return new Response('Missing hash parameter', { status: 400 })
  }
  if (Number.isNaN(Number(hash))) {
    return new Response('Hash parameter has to be valid number', { status: 400 })
  }
  if (!languageCodes.includes(lang)) {
    return new Response('Incorrect language code', { status: 400 })
  }

  try {
    const description = await sql<Description[]>`
    SELECT "description"
    FROM ${sql(lang)}
    WHERE "hash" = ${hash}
    AND timestamp = (
      SELECT MAX(timestamp)
      FROM ${sql(lang)}
      WHERE hash = ${hash}
    )`

    return new Response(trimEmptyDivElements(description[0]?.description || ''), {
      headers: {
        'content-type': 'text/plain',
      },
    })
  } catch (error) {
    return new Response('Internal error database exploded', { status: 500 })
  }
}
