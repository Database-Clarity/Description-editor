import type { Content, ContentPathKeys, Manifest } from '@tips/bungieTypes/manifest.js'

import { TypedObject, type LanguageCode } from '@tips/types'

async function persistentFetch<T>(
  url: RequestInfo | URL,
  numberOfTries: number,
  data: RequestInit | undefined = undefined
): Promise<T> {
  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

  try {
    const response = await fetch(url, data)
    if (!response.ok) throw new Error(response.statusText)
    const json = await response.json()
    return json
  } catch (error) {
    // if error, retry
    if (numberOfTries > 0) {
      await delay(1000)
      return persistentFetch(url, numberOfTries - 1, data)
    } else {
      throw error
    }
  }
}

const upperFirst = (string: string) => {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

export const fetchBungie = async <T extends keyof Content, L extends LanguageCode>(
  locations: T[],
  language: L[] | 'all'
): Promise<{
  [key in L]: { [key in keyof Pick<Content, T>]-?: Content[key] }
}> => {
  const manifest = await persistentFetch<Manifest>('https://www.bungie.net/Platform/Destiny2/Manifest/', 3)

  const contentLinks = manifest.Response.jsonWorldComponentContentPaths
  const selectedLanguages = language === 'all' ? TypedObject.keys(contentLinks) : language

  const promises: {
    [key in LanguageCode]?: { [key in keyof Content]-?: Promise<unknown> }
  } = {}

  for (let i = 0; i < selectedLanguages.length; i++) {
    const language = selectedLanguages[i]
    promises[language] = {} as { [key in keyof Content]-?: Promise<unknown> }

    for (let y = 0; y < locations.length; y++) {
      const location = locations[y]
      const fixedLocation = `Destiny${upperFirst(location)}Definition` as ContentPathKeys

      promises[language]![location] = persistentFetch(
        `https://www.bungie.net${contentLinks[language][fixedLocation]}?corsFix`,
        3
      )
    }
  }

  const content: {
    [key in LanguageCode]?: { [key in keyof Content]-?: unknown }
  } = {}

  for (let i = 0; i < selectedLanguages.length; i++) {
    const language = selectedLanguages[i]
    content[language] = {} as { [key in keyof Content]-?: unknown }

    for (let y = 0; y < locations.length; y++) {
      const location = locations[y]

      content[language]![location] = await promises[language]![location]
    }
  }

  return content as unknown as Promise<{
    [key in L]: { [key in keyof Pick<Content, T>]-?: Content[key] }
  }>
}
