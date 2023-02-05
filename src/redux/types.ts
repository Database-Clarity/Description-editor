import { Database, Languages, PerkTypes, WeaponTypes } from '@icemourne/description-converter'
import { InventoryItems, Stats } from '@icemourne/tool-box'

export type SettingsState = {
   currentlySelected: number
   language: Languages
   selectedType: PerkTypes
   editorType: 'normal' | 'dual' | 'multilanguage'
   messages: {
      message: string
      type?: 'error' | 'success'
   }[]
   weaponType: WeaponTypes
   globalUploadToLive: boolean
}

export type OriginalDatabase = {
   /** Only mutated after upload to live database used for comparison only */
   live: Database['perks']
   /** Only mutated after upload to intermediate database used for comparison only */
   intermediate: Database['perks']
}

export type GlobalState = {
   database: Database['perks']
   databaseSettings: Database['databaseSettings']
   settings: SettingsState
   readonly originalDatabase: OriginalDatabase
   readonly bungie: {
      inventoryItem: InventoryItems | undefined
      stat: Stats | undefined
   }
}
