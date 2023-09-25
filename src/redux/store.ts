import { PerkTypes } from '@icemourne/description-converter'
import { fetchBungieManifest } from '@icemourne/tool-box'
import { configureStore } from '@reduxjs/toolkit'
import _ from 'lodash'
import { defaultDescription, defaultPerk } from 'src/data/randomData'
import { getStartUpDescriptions } from 'src/utils/github'

import globalReducer from './globalSlice'
import { GlobalState } from './types'

const { inventoryItem, stat } = await fetchBungieManifest(['inventoryItem', 'stat'], 'en', false)
const { live, intermediate } = await getStartUpDescriptions()

const type = window.location.search.match(/type=(\w|\+)+/)?.[0].replace('type=', '').replaceAll('+', ' ') as PerkTypes | undefined
const hash = window.location.search.match(/perkHash=\d+/)?.[0].replace('perkHash=', '')

const preloadedState: { global: GlobalState } = {
   global: {
      database: {
         ...intermediate.perks,
         0: {
            ...defaultPerk,
            editor: {
               en: {
                  main: defaultDescription,
                  secondary: ''
               }
            }
         }
      },
      databaseSettings: intermediate.databaseSettings,
      settings: {
         currentlySelected: hash ? Number(hash) : 0,
         language: 'en' as const,
         selectedType: type || 'none' as const,
         editorType: 'normal' as const,
         messages: [],
         weaponType: 'AR' as const,
         globalUploadToLive: false
      },
      originalDatabase: {
         live: live.perks,
         intermediate: intermediate.perks
      },
      bungie: {
         inventoryItem,
         stat
      }
   }
}

export const store = configureStore({
   reducer: {
      global: globalReducer
   },
   preloadedState,
   middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
         thunk: true,
         serializableCheck: false,
         immutableCheck: false
      })
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch
