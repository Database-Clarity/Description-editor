import type { RequestHandler } from './$types'
import { squeal_ as squeal_ } from '$lib/server/squeal'
import { languageCodes, type LanguageCode } from '$lib/types'
import type postgres from 'postgres'
import { trimEmptyDivElements } from '$lib/utils'

type Description = {
  description: string
  username: string
  live: boolean
  ready: boolean
  timestamp: number
}

function fixDescription(descriptionObject: postgres.RowList<Description[]>) {
  const description = descriptionObject[0]?.description || ''

  return trimEmptyDivElements(description.replace(/<(\/)?descriptionImport.*?>/gi, ''))
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
    const description = await squeal_<Description[]>`
    SELECT "description"
    FROM ${squeal_(lang)}
    WHERE "hash" = ${hash}
    AND timestamp = (
      SELECT MAX(timestamp)
      FROM ${squeal_(lang)}
      WHERE hash = ${hash}
    )`

    return new Response(fixDescription(description), {
      headers: {
        'content-type': 'text/plain',
      },
    })
  } catch (error) {
    return new Response('Internal error database exploded', { status: 500 })
  }
}
