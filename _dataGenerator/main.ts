import * as schema from '@drizzle/schema.js'

import type { LanguageCode, PerkTypes } from '@tips/types'
import {
  armorModLinking,
  enhancedPerkLinking,
  exoticWeaponLinking,
  originTraitLinking,
  weaponFrameLinking,
} from './utils/perkLinking'

import { armorMods } from './filters/armorMod'
import { artifactMods } from './filters/artifactMod'
import { drizzle } from 'drizzle-orm/postgres-js'
import { exoticArmors } from './filters/exoticArmor'
import { exoticsWeapons } from './filters/exoticWeapon'
import { fetchBungie } from './utils/fetchBungieManifest'
import { ghostMods } from './filters/ghostMods'
import { legendaryWeapons } from './filters/legendaryWeapon'
import { perkSchema } from '@drizzle/schema.js'
import process from 'process'
import { sql } from 'drizzle-orm'
import { squeal } from '@drizzle/squeal.js'
import { subclass } from './filters/subclass'
import { timeTracker } from './utils/timeTracker'
import { weaponCraftingRecipes } from './filters/weaponCraftingRecipes'

export type PerkData = {
  appearsOn: Set<string | number>
  name: string
  hash: number
  type: PerkTypes
  linkedWith?: number[]
}

export type PerkDataList = {
  [key: string]: PerkData
}

type PrefixNames<T extends string, N extends string> = T extends `${infer L}` ? `${N}${L}` : never
type Name_lang = PrefixNames<LanguageCode, 'name_'>
type ItemName_lang = PrefixNames<LanguageCode, 'itemName_'>

type Names = {
  [K in Name_lang]: string
}
type ItemNames = {
  [K in ItemName_lang]?: string
}

export type FinalData = {
  [key: string]: {
    appearsOn: (string | number)[]
    hash: number
    itemHash?: number
    type: PerkTypes
    icon: string
    itemIcon?: string
    linkedWith?: number[]
  } & Names &
    ItemNames
}
;(async () => {
  timeTracker.start()

  const {
    en: { inventoryItem, plugSet, socketType },
  } = await fetchBungie(['inventoryItem', 'plugSet', 'socketType'], ['en'])

  if (inventoryItem === undefined || plugSet === undefined || socketType === undefined) {
    throw new Error('Failed to fetch manifest')
  }

  for (const key in inventoryItem) {
    const item = inventoryItem[key]

    if (
      (item.itemType === 2 || item.itemType === 3) &&
      !item.quality?.versions.some((powerCap) => powerCap.powerCapHash === 2759499571) // 2759499571 = 999990 power cap
    ) {
      // remove weapons and armor with power cap
      delete inventoryItem[key]
      continue
    }

    // remove deprecated items
    if (item.displayProperties.description.match(/deprecated/i) || item.displayProperties.name.match(/deprecated/i)) {
      delete inventoryItem[key]
      continue
    }

    // remove shaders
    if (item.itemTypeDisplayName === 'Shader' || item.itemCategoryHashes?.includes(41) || item.itemSubType === 20) {
      delete inventoryItem[key]
      continue
    }

    // remove trackers
    if (item.plug?.plugCategoryHash === 2947756142) {
      delete inventoryItem[key]
      continue
    }

    // remove ornaments
    if (
      item.itemCategoryHashes?.includes(56) ||
      item.itemSubType === 21 ||
      item.itemTypeDisplayName?.endsWith('Ornament')
    ) {
      delete inventoryItem[key]
      continue
    }

    // remove dummy items
    if (item.itemType === 20 || item.itemCategoryHashes?.includes(3109687656)) {
      delete inventoryItem[key]
      continue
    }

    // remove items with out name
    if (item.displayProperties.name === '') {
      delete inventoryItem[key]
      continue
    }

    // remove masterworks
    if (item.plug?.plugCategoryIdentifier.match(/masterwork/i))
      if (
        item.plug?.plugCategoryIdentifier.match(/stat|kills|armor|ghosts/i) ||
        item.plug?.uiPlugLabel.match(/interactable/i)
      ) {
        delete inventoryItem[key]
        continue
      }

    // remove memento
    if (item.itemTypeAndTierDisplayName?.match(/memento/i)) {
      delete inventoryItem[key]
      continue
    }

    // remove empty sockets
    if (item.displayProperties.name?.match(/empty [\s\S]+ socket/i)) {
      delete inventoryItem[key]
      continue
    }

    // remove classified, redacted items
    if (item.redacted || item.displayProperties.name?.match(/classified/i)) {
      delete inventoryItem[key]
      continue
    }

    // remove stat mods
    if (
      item.displayProperties.name.match(/(Resilience|Recovery|Discipline|Mobility|Strength|Intellect)( Mod|-Forged)/i)
    ) {
      delete inventoryItem[key]
      continue
    }

    // black listing random stuff
    if (
      item.itemTypeDisplayName === 'Solstice Embers' ||
      item.itemTypeDisplayName === 'Kindling' ||
      item.displayProperties.name === 'Reset Artifact' ||
      item.displayProperties.icon === '/common/destiny2_content/icons/564c4604b7e78e78bf126359b91990e5.jpg' // pink icon
    ) {
      delete inventoryItem[key]
      continue
    }

    // remove bungie fuckups
    if (
      item.hash === 2132353550 || // osteo striga catalyst // can't be equipped
      item.hash === 712324018 || //  transformative perk   // basically place holder
      item.hash === 1906855381 || // aeon safe             // dummy item
      item.hash === 2076339106 || // aeon soul             // dummy item
      item.hash === 1656912113 //    aeon swift            // dummy item
    ) {
      delete inventoryItem[key]
      continue
    }

    // remove random crap
    // this is just to reduce number of items to process
    const randomCrap_itemType = new Set([9, 12, 14, 15, 17, 21, 22, 25, 26])
    const randomCrap_itemCategoryHashes = new Set([
      34, 43, 44, 53, 56, 58, 1404791674, 1112488720, 208981632, 874645359, 1873949940,
    ])
    if (
      randomCrap_itemType.has(item.itemType) ||
      item.itemCategoryHashes?.some((hash) => randomCrap_itemCategoryHashes.has(hash)) ||
      item.displayProperties.name === 'Legendary Engram' ||
      item.displayProperties.name === 'Deepsight Resonance' ||
      item.displayProperties.name === 'Extract Pattern' ||
      item.displayProperties.name === 'Locked Armor Mod' ||
      item.displayProperties.name === 'Trait Locked' ||
      item.itemTypeDisplayName === 'Material' ||
      item.itemTypeDisplayName === 'Armor Set' ||
      item.itemTypeDisplayName?.replaceAll('"', '') === 'Holiday Gift' ||
      item.itemTypeDisplayName?.endsWith('Engram') ||
      item.itemTypeDisplayName?.endsWith('Currency') ||
      (item.itemType === 0 && item.quality?.versions.some((x) => x.powerCapHash === 2759499571))
    ) {
      delete inventoryItem[key]
      continue
    }
  }

  const data: PerkDataList = {}

  // these \/ functions modify data object
  armorMods(inventoryItem, plugSet, data)
  artifactMods(inventoryItem, data)
  exoticArmors(inventoryItem, plugSet, data)
  exoticsWeapons(inventoryItem, plugSet, socketType, data)
  ghostMods(inventoryItem, plugSet, data)
  legendaryWeapons(inventoryItem, plugSet, data)
  subclass(inventoryItem, plugSet, data)
  weaponCraftingRecipes(inventoryItem, plugSet, data)

  exoticWeaponLinking(data, inventoryItem)
  weaponFrameLinking(data)
  originTraitLinking(data)
  armorModLinking(data)
  enhancedPerkLinking(data)
  // these /\ functions modify data object

  const fixAppearsOn = (data: (string | number)[]) => {
    const dataArr = data.map((x) => {
      if (typeof x === 'string') return x
      return inventoryItem[x].itemTypeDisplayName!
    })
    return [...new Set(dataArr)]
  }

  const {
    de: { inventoryItemLite: invLightDe },
    es: { inventoryItemLite: invLightEs },
    'es-mx': { inventoryItemLite: invLightEsMx },
    fr: { inventoryItemLite: invLightFr },
    it: { inventoryItemLite: invLightIt },
    ja: { inventoryItemLite: invLightJa },
    ko: { inventoryItemLite: invLightKo },
    pl: { inventoryItemLite: invLightPl },
    'pt-br': { inventoryItemLite: invLightPtBr },
    ru: { inventoryItemLite: invLightRu },
    'zh-chs': { inventoryItemLite: invLightZhChs },
    'zh-cht': { inventoryItemLite: invLightZhCht },
  } = await fetchBungie(['inventoryItemLite'], 'all')

  const finalData = Object.entries(data).reduce((acc, [key, item]) => {
    const appearsOnArr = Array.from(item.appearsOn)
    const isLegendary = appearsOnArr.some((x) => typeof x === 'string')

    // change exotic hash to name on legendary perks
    const appearsOn = isLegendary ? fixAppearsOn(appearsOnArr) : appearsOnArr

    const itemHash = appearsOn.every((value) => typeof value === 'number') ? (appearsOn[0] as number) : null

    acc[key] = {
      appearsOn,

      name_en: item.name,
      name_de: invLightDe[key].displayProperties.name,
      name_es: invLightEs[key].displayProperties.name,
      'name_es-mx': invLightEsMx[key].displayProperties.name,
      name_fr: invLightFr[key].displayProperties.name,
      name_it: invLightIt[key].displayProperties.name,
      name_ja: invLightJa[key].displayProperties.name,
      name_ko: invLightKo[key].displayProperties.name,
      name_pl: invLightPl[key].displayProperties.name,
      'name_pt-br': invLightPtBr[key].displayProperties.name,
      name_ru: invLightRu[key].displayProperties.name,
      'name_zh-chs': invLightZhChs[key].displayProperties.name,
      'name_zh-cht': invLightZhCht[key].displayProperties.name,

      icon: inventoryItem[key].displayProperties.icon?.replace('/common/destiny2_content/icons', '') || '',
      hash: item.hash,
      type: item.type,
      linkedWith: item.linkedWith?.length !== 0 ? item.linkedWith : undefined,
    }

    if (itemHash) {
      acc[key] = Object.assign(acc[key], {
        itemName_en: inventoryItem[itemHash].displayProperties.name,
        itemName_de: invLightDe[itemHash].displayProperties.name,
        itemName_es: invLightEs[itemHash].displayProperties.name,
        'itemName_es-mx': invLightEsMx[itemHash].displayProperties.name,
        itemName_fr: invLightFr[itemHash].displayProperties.name,
        itemName_it: invLightIt[itemHash].displayProperties.name,
        itemName_ja: invLightJa[itemHash].displayProperties.name,
        itemName_ko: invLightKo[itemHash].displayProperties.name,
        itemName_pl: invLightPl[itemHash].displayProperties.name,
        'itemName_pt-br': invLightPtBr[itemHash].displayProperties.name,
        itemName_ru: invLightRu[itemHash].displayProperties.name,
        'itemName_zh-chs': invLightZhChs[itemHash].displayProperties.name,
        'itemName_zh-cht': invLightZhCht[itemHash].displayProperties.name,

        itemIcon: inventoryItem[itemHash].displayProperties.icon?.replace('/common/destiny2_content/icons', '') || '',
        itemHash,
      })
    }

    return acc
  }, {} as FinalData)

  const db = drizzle(squeal(process.env, false), { schema })

  db.insert(perkSchema)
    .values(Object.values(finalData))
    .onConflictDoUpdate({
      target: [perkSchema.hash],
      set: {
        itemHash: sql`excluded.itemHash`,

        name_en: sql`name_en = excluded.name_en`,
        name_de: sql`excluded.name_de`,
        name_es: sql`excluded.name_es`,
        'name_es-mx': sql`excluded.name_es-mx`,
        name_fr: sql`excluded.name_fr`,
        name_it: sql`excluded.name_it`,
        name_ja: sql`excluded.name_ja`,
        name_ko: sql`excluded.name_ko`,
        name_pl: sql`excluded.name_pl`,
        'name_pt-br': sql`excluded.name_pt-br`,
        name_ru: sql`excluded.name_ru`,
        'name_zh-chs': sql`excluded.name_zh-chs`,
        'name_zh-cht': sql`excluded.name_zh-cht`,

        itemName_en: sql`excluded.itemName_en`,
        itemName_de: sql`excluded.itemName_de`,
        itemName_es: sql`excluded.itemName_es`,
        'itemName_es-mx': sql`excluded.itemName_es-mx`,
        itemName_fr: sql`excluded.itemName_fr`,
        itemName_it: sql`excluded.itemName_it`,
        itemName_ja: sql`excluded.itemName_ja`,
        itemName_ko: sql`excluded.itemName_ko`,
        itemName_pl: sql`excluded.itemName_pl`,
        'itemName_pt-br': sql`excluded.itemName_pt-br`,
        itemName_ru: sql`excluded.itemName_ru`,
        'itemName_zh-chs': sql`excluded.itemName_zh-chs`,
        'itemName_zh-cht': sql`excluded.itemName_zh-cht`,

        type: sql`excluded.type`,
        icon: sql`excluded.icon`,
        itemIcon: sql`excluded.itemIcon`,
        appearsOn: sql`excluded.appearsOn`,
        linkedWith: sql`excluded.linkedWith`,
      },
    })

  timeTracker.stop()
  console.log('Completed in', timeTracker.getElapsedTime())
})()
