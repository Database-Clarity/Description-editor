import { createSlice } from '@reduxjs/toolkit'

import { databaseReducers } from './reducers/dataBase'
import { settingsReducers } from './reducers/settings'
import { GlobalState } from './types'

const initialState = {} as GlobalState

export const globalSlice = createSlice({
   name: 'global',
   initialState,
   reducers: {
      ...settingsReducers,
      ...databaseReducers
   }
})

export const {
   // settings
   changePerkType,
   changeSelectedPerk,
   changeEditorType,
   changeLanguage,
   addMessage,
   removeLastMessage,
   changeWeaponType,
   toggleUploadToLiveOnEdit,

   // database
   togglePerkStuff,
   updateEditorValue,
   updateStats,
   setStatImport,
   resetPerk,
   restoreFromBackup
} = globalSlice.actions

export default globalSlice.reducer
