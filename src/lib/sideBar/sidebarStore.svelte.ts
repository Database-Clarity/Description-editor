import type { LanguageCode, PerkTypes } from '$lib/types'

export type SidebarStoreType = {
  hash: number
  itemHash: number | null
  type: PerkTypes | 'none'
  language: LanguageCode
  editorType: 'normal' | 'dual' | 'multiLanguage'
}

export const sidebarStore = $state<SidebarStoreType>({
  hash: 0,
  itemHash: null,
  type: 'none',
  language: 'en',
  editorType: 'normal',
})
