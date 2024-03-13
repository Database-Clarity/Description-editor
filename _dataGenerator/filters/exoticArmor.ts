import type { InventoryItems, PlugSets } from '@tips/bungieTypes/manifest'

import type { InventoryItem } from '@tips/bungieTypes/inventoryItem'
import type { PerkDataList } from '_dataGenerator/main'
import type { PerkTypes } from '@tips/types'
import { getAllFromSocket } from '_dataGenerator/utils/getAllFromSocket'

export const exoticArmors = (inventoryItems: InventoryItems, plugSets: PlugSets, data: PerkDataList) => {
  const armorArr = Object.values(inventoryItems).filter(
    (item) => item.itemType === 2 && item.itemTypeAndTierDisplayName?.includes('Exotic')
  )

  const addData = (armor: InventoryItem, perk: InventoryItem, type: PerkTypes) => {
    const armorHash = armor.hash

    if (data[perk.hash] !== undefined) {
      data[perk.hash].appearsOn.add(armorHash)
      return
    }

    data[perk.hash] = {
      appearsOn: new Set([armorHash]),
      name: perk.displayProperties.name,
      hash: Number(perk.hash),
      type,
    }
  }

  armorArr.forEach((armor) => {
    const perkArr = getAllFromSocket(inventoryItems, plugSets, armor, ['armor mods', 'armor perks'])

    perkArr.forEach((perk) => {
      if (perk.itemTypeDisplayName === 'Intrinsic' || perk.itemTypeDisplayName === 'Aeon Cult Mod') {
        addData(armor, perk, 'Armor Trait Exotic')
      }
    })
  })
}
