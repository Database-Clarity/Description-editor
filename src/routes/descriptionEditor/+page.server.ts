import { loadPageData } from '$lib/server/databaseAccess'
import { languageCodes, type LanguageCode } from '$lib/types'
import type { PageServerLoad } from './$types'

export const load = (async ({ url }) => {
  const hashParam = Number(url.searchParams.get('hash'))
  const langParam = url.searchParams.get('lang')
  const timestampParam = Number(url.searchParams.get('timestamp'))
  const editorParam = url.searchParams.get('editor')

  const hash = isNaN(hashParam) ? 0 : hashParam
  const lang = languageCodes.includes(langParam as LanguageCode) ? (langParam as LanguageCode) : 'en'
  const timestamp = isNaN(timestampParam) ? 0 : timestampParam
  const editor = ['single', 'dual'].includes(editorParam || '') ? editorParam : 'single'

  return Object.assign(await loadPageData(hash, lang, timestamp), { hash, lang, editor })
}) satisfies PageServerLoad
