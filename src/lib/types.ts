import { TypedObject } from './utils'
import type postgres from 'postgres'

export type PendingQuery<T extends postgres.MaybeRow[]> = postgres.PendingQuery<T>

export const perkTypes = [
  'Armor Trait Exotic',
  'Armor Mod General',
  'Armor Mod Combat',
  'Armor Mod Activity',
  'Armor Mod Seasonal',
  // ---------
  'Weapon Perk',
  'Weapon Perk Exotic',
  // ---------
  'Weapon Trait',
  'Weapon Trait Exotic',
  'Weapon Trait Origin',
  'Weapon Trait Origin Exotic',
  'Weapon Trait Enhanced',
  'Weapon Trait Enhanced Exotic',
  // ---------
  'Weapon Frame',
  'Weapon Frame Exotic',
  'Weapon Frame Enhanced',
  'Weapon Frame Enhanced Exotic',
  // ---------
  'Weapon Catalyst Exotic',
  // ---------
  'Weapon Mod',
  // ---------
  'Subclass Fragment',
  'Subclass Aspect',
  'Subclass Super',
  'Subclass Grenade',
  'Subclass Melee',
  'Subclass Class',
  'Subclass Movement',
  // ---------
  'Ghost Mod',
] as const
export type PerkTypes = (typeof perkTypes)[number]

export const languageNames = {
  en: 'English',
  de: 'German',
  es: 'Spanish',
  'es-mx': 'Spanish (Mexico)',
  fr: 'French',
  it: 'Italian',
  ja: 'Japanese',
  ko: 'Korean',
  pl: 'Polish',
  'pt-br': 'Portuguese (Brazil)',
  ru: 'Russian',
  'zh-chs': 'Chinese (Simplified)',
  'zh-cht': 'Chinese (Traditional)',
} as const

export const languageCodes = TypedObject.keys(languageNames)
export type LanguageCode = (typeof languageCodes)[number]

type ReplaceDashWithUnderscore<T extends string> = T extends `${infer L}-${infer R}` ? `${L}_${R}` : T

export const languageCodesUnderscore = languageCodes.map((lang) => lang.replace('-', '_')) as LanguageCodeUnderscore[]
export type LanguageCodeUnderscore = ReplaceDashWithUnderscore<LanguageCode>

export const editorTypes = ['normal', 'dual', 'multiLanguage'] as const
export type EditorType = (typeof editorTypes)[number]

export type Perk = {
  hash: number
  name: string
  type: PerkTypes
}

export type EditorLayoutData = {
  perksPromise: PendingQuery<Perk[]>
  lang: LanguageCode
}

export const descriptionTypes: { [key: string]: { [key in PerkTypes]?: string } } = {
  Exotics: {
    'Armor Trait Exotic': 'Armor',
    'Weapon Frame Exotic': 'Weapon',
  },
  Weapon: {
    'Weapon Trait': 'Trait',
    // 'Weapon Trait Enhanced': 'Enhanced Trait', // removed from database
    'Weapon Perk': 'Perk',
    'Weapon Trait Origin': 'Origin Trait',
    'Weapon Frame': 'Frame',
    'Weapon Frame Enhanced': 'Enhanced Frame', // probably will remove this too
  },
  'Abilities / Subclass stuff': {
    'Subclass Fragment': 'Fragment',
    'Subclass Aspect': 'Aspect',
    'Subclass Super': 'Super',
    'Subclass Grenade': 'Grenade',
    'Subclass Melee': 'Melee',
    'Subclass Class': 'Class',
    'Subclass Movement': 'Movement',
  },
  Mods: {
    'Armor Mod General': 'Armor General',
    'Armor Mod Activity': 'Armor Activity',
    'Armor Mod Seasonal': 'Armor Seasonal',
    'Weapon Mod': 'Weapon',
    'Ghost Mod': 'Ghost',
  },
}
