import { PerkTypes, WeaponTypes } from "@icemourne/description-converter"
import { PayloadAction } from "@reduxjs/toolkit"
import { WritableDraft } from "immer/dist/internal"
import { GlobalState, SettingsState } from "../interfaces"

type State = WritableDraft<GlobalState>

export const settingsReducers = {
   changePerkType: (state: State, action: PayloadAction<PerkTypes>) => {
      state.settings.selectedType = action.payload
   },
   changeSelectedPerk: (state: State, action: PayloadAction<number>) => {
      state.settings.currentlySelected = action.payload
   },
   toggleHiddenPerkDisplay: (state: State) => {
      state.settings.displayHiddenPerks = !state.settings.displayHiddenPerks
   },
   changeEditorType: (state: State, action: PayloadAction<SettingsState['editorType']>) => {
      state.settings.editorType = action.payload
   },
   changeLanguage: (state: State, action: PayloadAction<SettingsState['language']>) => {
      state.settings.language = action.payload
   },
   toggleNewPerkWindow: (state: State) => {
      state.settings.newPerkWindow = !state.settings.newPerkWindow
   },
   addMessage: (state: State, action: PayloadAction<{message: string, type?: 'error' | 'success'}>) => {
      state.settings.messages = [
         ...state.settings.messages,
         action.payload
      ]
   },
   removeLastMessage: (state: State) => {
      state.settings.messages = state.settings.messages.slice(1)
   },
   changeWeaponType: (state: State, action: PayloadAction<WeaponTypes>) => {
      state.settings.weaponType = action.payload
   },
   toggleUploadToLiveOnEdit: (state: State) => {
      state.settings.globalUploadToLive = !state.settings.globalUploadToLive
   }
}
