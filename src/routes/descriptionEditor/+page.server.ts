import { loadPageData } from '$lib/server/databaseAccess'
import type { PageServerLoad } from './$types'

export const load = (async ({ url }) => {
  const hash = Number(url.searchParams.get('hash')) || 0 // TODO: 0 is a placeholder
  const language = url.searchParams.get('language') || 'en'

  return await loadPageData(hash, language)
}) satisfies PageServerLoad
