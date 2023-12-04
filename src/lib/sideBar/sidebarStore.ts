import { browser } from '$app/environment'
import type { Language, PerkTypes } from '$lib/types'
import { writable } from 'svelte/store'

export type SidebarStoreType = {
  hash: number
  type: PerkTypes | 'none'
  weaponName?: string
  language: Language
  editorType: 'normal' | 'dual' | 'multiLanguage'
}

const { set, subscribe, update } = writable<SidebarStoreType>({
  hash: 0,
  type: 'none',
  language: 'en',
  editorType: 'normal',
})

export const sidebarStore = {
  subscribe,
  set,
  update,
}

sidebarStore.subscribe((value) => {
  if (!browser) return

  const params = new URLSearchParams(location.search)

  if (!params.has('hash', String(value.hash))) {
    params.set('hash', String(value.hash))
    console.log(123)
  }

  if (!params.has('language', value.language)) {
    params.set('language', value.language)
  }
})
