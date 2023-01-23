import { GlobalState } from './interfaces'
import { createSlice } from '@reduxjs/toolkit'
import { databaseReducers } from './reducers/dataBase'
import { settingsReducers } from './reducers/settings'

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
   toggleHiddenPerkDisplay,
   changeEditorType,
   changeLanguage,
   toggleNewPerkWindow,
   addMessage,
   removeLastMessage,
   changeWeaponType,
   toggleUploadToLiveOnEdit,

   // database
   togglePerkStuff,
   updateEditorValue,
   updateStats,
   setStatImport,
   addPerk,
   resetPerk,
   updateDatabase
} = globalSlice.actions

export default globalSlice.reducer
