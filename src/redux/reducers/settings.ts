import { PerkTypes, WeaponTypes } from "@icemourne/description-converter"
import { PayloadAction } from "@reduxjs/toolkit"
import { WritableDraft } from "immer/dist/internal"

import { GlobalState, SettingsState } from "../types"

type State = WritableDraft<GlobalState>
const url = new URL(window.location.href)

export const settingsReducers = {
   changePerkType: (state: State, action: PayloadAction<PerkTypes>) => {
      state.settings.selectedType = action.payload

      url.searchParams.set('type', String(action.payload));
      history.pushState({}, '', url);
   },
   changeSelectedPerk: (state: State, action: PayloadAction<number>) => {
      state.settings.currentlySelected = action.payload

      url.searchParams.set('perkHash', String(action.payload));
      history.pushState({}, '', url);
   },
   changeEditorType: (state: State, action: PayloadAction<SettingsState['editorType']>) => {
      state.settings.editorType = action.payload
   },
   changeLanguage: (state: State, action: PayloadAction<SettingsState['language']>) => {
      state.settings.language = action.payload

      url.searchParams.set('language', String(action.payload));
      history.pushState({}, '', url);
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
