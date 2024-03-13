// import { browser } from '$app/environment'
import type { LanguageCode, PerkTypes } from '$lib/types'
// import { writable } from 'svelte/store'

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

// TODO: check if it updates on value change or store change if store split them in to multiple effects
// update url search params on store change
// $effect(() => {
//   const url = new URL(window.location.href)

//   if (!url.searchParams.has('hash', String(sidebarStore.hash))) {
//     url.searchParams.set('hash', String(sidebarStore.hash))
//     history.pushState({}, '', url)
//   }

//   if (!url.searchParams.has('language', sidebarStore.language)) {
//     url.searchParams.set('language', String(sidebarStore.language))
//     history.pushState({}, '', url)
//   }

//   if (!url.searchParams.has('editorType', sidebarStore.editorType)) {
//     url.searchParams.set('editorType', String(sidebarStore.editorType))
//     history.pushState({}, '', url)
//   }
// })

// const { set, subscribe, update } = writable<SidebarStoreType>({
//   hash: 0,
//   itemHash: null,
//   type: 'none',
//   language: 'en',
//   editorType: 'normal',
// })

// export const sidebarStore = {
//   subscribe,
//   set,
//   update,
// }

// // TODO: figure out how to unsubscribe or move to a component
// sidebarStore.subscribe((store) => {
//   if (!browser) return

//   const url = new URL(window.location.href)

//   if (!url.searchParams.has('hash', String(store.hash))) {
//     url.searchParams.set('hash', String(store.hash))
//     history.pushState({}, '', url)
//   }

//   if (!url.searchParams.has('language', store.language)) {
//     url.searchParams.set('language', String(store.language))
//     history.pushState({}, '', url)
//   }

//   if (!url.searchParams.has('editorType', store.editorType)) {
//     url.searchParams.set('editorType', String(store.editorType))
//     history.pushState({}, '', url)
//   }
// })
