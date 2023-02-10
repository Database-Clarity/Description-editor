import { Database, Stats } from '@icemourne/description-converter'

import { GlobalState } from '../types'
import { PayloadAction } from '@reduxjs/toolkit'
import { WritableDraft } from 'immer/dist/internal'
import { getLoginDetails } from 'src/utils/getLogin'
import { useAppSelector } from '../hooks'

export type ButtonActions = 'uploadToLive'
type State = WritableDraft<GlobalState>

export const databaseReducers = {
   togglePerkStuff: (state: State, action: PayloadAction<ButtonActions>) => {
      const currentlySelected = state.settings.currentlySelected
      state.database[currentlySelected][action.payload] = !state.database[currentlySelected][action.payload]
   },
   updateEditorValue: (state: State, action: PayloadAction<[string, 'main' | 'secondary']>) => {
      const currentlySelected = state.settings.currentlySelected,
         language = state.settings.language
      const editor = action.payload[1],
         description = action.payload[0].replaceAll('\r', '')

      // add langue if it's not already there
      if (state.database[currentlySelected].editor[language] === undefined) {
         state.database[currentlySelected].editor[language] = {
            main: '',
            secondary: ''
         }
      }
      state.database[currentlySelected].editor[language]![editor] = description
      state.database[currentlySelected].updateTracker.descriptions[language] = {
         lastUpdate: Date.now(),
         updatedBy: getLoginDetails()?.username || ''
      }

      if (state.settings.globalUploadToLive) {
         state.database[currentlySelected].uploadToLive = true
      }
   },
   updateStats: (state: State, action: PayloadAction<{ hash: number; stats: Stats | undefined }>) => {
      const { hash, stats } = action.payload
      state.database[hash].stats = stats
      state.database[hash].updateTracker.stats = {
         lastUpdate: Date.now(),
         updatedBy: getLoginDetails()?.username || ''
      }
      if (state.settings.globalUploadToLive) {
         state.database[hash].uploadToLive = true
      }
   },
   setStatImport: (state: State, action: PayloadAction<{ addImportTo: number; importFrom: number }>) => {
      const { addImportTo, importFrom } = action.payload

      state.database[addImportTo].importStatsFrom = importFrom === 0 ? undefined : importFrom
      state.database[addImportTo].updateTracker.stats = {
         lastUpdate: Date.now(),
         updatedBy: getLoginDetails()?.username || ''
      }
   },
   resetPerk: (state: State, action: PayloadAction<number>) => {
      state.database[action.payload] = state.originalDatabase.live[action.payload]
   }
}
/**
 * @param hash Optional perk hash
 * @returns If hash was provided and perk found returns that perk otherwise return selected perk
 */
export const getPerk = (hash?: number) => {
   const currentState = useAppSelector((state) => state.global)
   if (hash) {
      return currentState.database[hash] || currentState.database[currentState.settings.currentlySelected]
   }
   return currentState.database[currentState.settings.currentlySelected]
}
