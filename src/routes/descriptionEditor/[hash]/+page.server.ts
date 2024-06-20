import { languageCodes, type LanguageCode } from '$lib/types'
import { comment, description } from '$lib/server/queries'

export const load = async ({ url, params }) => {
  const hashParam = Number(params.hash)
  const langParam = url.searchParams.get('lang') as LanguageCode
  const editorParam = url.searchParams.get('editor')

  const hash = isNaN(hashParam) ? 0 : hashParam
  const lang = languageCodes.includes(langParam) ? langParam : languageCodes[0]
  const editor = ['single', 'dual'].includes(editorParam || '') ? editorParam : 'single'

  const descriptionPromise = description(lang, hash)

  const comments = comment(hash)

  return { descriptionPromise, comments, hash, editor, test: 'test' }
}
