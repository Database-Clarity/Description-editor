import { browser } from '$app/environment'
import type { LanguageCode, PerkTypes } from '$lib/types'
import { writable } from 'svelte/store'

export type SidebarStoreType = {
  hash: number
  itemHash: number | null
  type: PerkTypes | 'none'
  language: LanguageCode
  editorType: 'normal' | 'dual' | 'multiLanguage'
}

const { set, subscribe, update } = writable<SidebarStoreType>({
  hash: 0,
  itemHash: null,
  type: 'none',
  language: 'en',
  editorType: 'normal',
})

export const sidebarStore = {
  subscribe,
  set,
  update,
}

// update url search params on store change
// TODO: figure out how to unsubscribe or move to a component
sidebarStore.subscribe((store) => {
  if (!browser) return

  const url = new URL(window.location.href)

  if (!url.searchParams.has('hash', String(store.hash))) {
    url.searchParams.set('hash', String(store.hash))
    history.pushState({}, '', url)
  }

  if (!url.searchParams.has('language', store.language)) {
    url.searchParams.set('language', String(store.language))
    history.pushState({}, '', url)
  }

  if (!url.searchParams.has('editorType', store.editorType)) {
    url.searchParams.set('editorType', String(store.editorType))
    history.pushState({}, '', url)
  }
})
