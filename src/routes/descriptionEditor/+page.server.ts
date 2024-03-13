import { loadPageData } from '$lib/server/databaseAccess'
import type { PageServerLoad } from './$types'
import { languageCodes, type LanguageCode } from '$lib/types'

export const load = (async ({ url }) => {
  const hashParam = Number(url.searchParams.get('hash'))
  const hash = isNaN(hashParam) ? 0 : hashParam

  const languageParam = url.searchParams.get('language')
  const isValidLanguageParam = languageCodes.includes(languageParam as LanguageCode)
  const language = isValidLanguageParam ? (languageParam as LanguageCode) : 'en'

  return {} // Object.assign(await loadPageData(hash, language, true), { hash, language })
}) satisfies PageServerLoad
