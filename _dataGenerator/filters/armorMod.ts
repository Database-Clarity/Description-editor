import type { InventoryItems, PlugSets } from '@tips/bungieTypes/manifest'

import type { InventoryItem } from '@tips/bungieTypes/inventoryItem'
import type { PerkDataList } from '_dataGenerator/main'
import type { PerkTypes } from '@tips/types'
import { getAllFromSocket } from '_dataGenerator/utils/getAllFromSocket'

export const armorMods = (inventoryItems: InventoryItems, plugSets: PlugSets, data: PerkDataList) => {
  const armorArr = Object.values(inventoryItems).filter(
    (item) => item.itemType === 2 && item.itemTypeAndTierDisplayName?.includes('Legendary')
  )

  const addData = (armor: InventoryItem, perk: InventoryItem, type: PerkTypes) => {
    const armorType = armor.itemTypeDisplayName?.match(/hunter cloak|titan mark|warlock bond/i)
      ? 'Class Item'
      : armor.itemTypeDisplayName
    if (armorType === undefined) return

    if (data[perk.hash] !== undefined) {
      data[perk.hash].appearsOn.add(armorType)
      return
    }

    data[perk.hash] = {
      appearsOn: new Set([armorType]),
      name: perk.displayProperties.name,
      hash: Number(perk.hash),
      type,
    }
  }

  armorArr.forEach((armor) => {
    const modsArr = getAllFromSocket(inventoryItems, plugSets, armor, ['armor mods'])

    modsArr.forEach((mod) => {
      if (mod.itemTypeDisplayName?.match(/(general|helmet|arms|chest|leg|class item) armor mod/i)) {
        addData(armor, mod, 'Armor Mod General')
        return
      }

      if (mod.displayProperties.description.match(/raid/i) || mod?.itemTypeDisplayName?.match(/nightmare mod/i)) {
        addData(armor, mod, 'Armor Mod Activity')
      }
    })
  })
}
