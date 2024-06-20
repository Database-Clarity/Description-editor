import { error, json } from '@sveltejs/kit'

import type { LanguageCode } from '$lib/types.js'
import { hasEditPermissions, insertDescription } from '$lib/server/queries'

type RequestJson = {
  lang: LanguageCode
  description: string
  live: boolean
  ready: boolean
  hash: number
}

export async function POST({ request, cookies }) {
  const { description, lang, hash, live, ready }: RequestJson = await request.json()

  if (!hasEditPermissions(cookies)) {
    return error(401, 'Unauthorized')
  }

  const inserted = insertDescription(description, lang, hash, live, ready, cookies)

  if (!inserted) {
    return error(500, 'Failed to insert description')
  }
  return json({ status: 201 })
}
