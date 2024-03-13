type Entries<T> = {
  [K in keyof T]: [K, T[K]]
}[keyof T][]

export class TypedObject {
  static entries<T extends object>(obj: T) {
    return Object.entries(obj) as Entries<T>
  }
  static keys<T extends object>(obj: T) {
    return Object.keys(obj) as (keyof T)[]
  }
  static fromEntries<T extends Array<readonly [string, unknown]>>(entries: T) {
    return Object.fromEntries(entries) as Record<T[number][0], T[number][1]>
  }
}

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
  itemHash: number | null
  name: { [key in LanguageCode]: string }
  itemName: { [key in LanguageCode]: string }
  type: PerkTypes
  icon: string
  itemIcon: string
  appearsOn: string[] | number[]
  linkedWith: number[] | null
}
