import { perks } from '$lib/server/queries.js'
import { languageCodes, type LanguageCode } from '$lib/types'

export const load = async ({ url }) => {
  const langParam = url.searchParams.get('lang')
  const lang = languageCodes.includes(langParam as LanguageCode) ? (langParam as LanguageCode) : 'en'

  const perksPromise = perks(lang)

  return { perksPromise, lang }
}
