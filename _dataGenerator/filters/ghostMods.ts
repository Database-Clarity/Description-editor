import type { InventoryItems, PlugSets } from '@tips/bungieTypes/manifest'

import type { InventoryItem } from '@tips/bungieTypes/inventoryItem'
import type { PerkDataList } from '_dataGenerator/main'
import type { PerkTypes } from '@tips/types'
import { getAllFromSocket } from '_dataGenerator/utils/getAllFromSocket'

export const ghostMods = (inventoryItems: InventoryItems, plugSets: PlugSets, data: PerkDataList) => {
  const ghostArr = Object.values(inventoryItems).filter((item) => item.itemType === 24)

  const addData = (ghost: InventoryItem, perk: InventoryItem, type: PerkTypes) => {
    const ghostType = ghost.itemTypeDisplayName
    if (ghostType === undefined) return

    if (data[perk.hash] !== undefined) {
      data[perk.hash].appearsOn.add(ghostType)
      return
    }

    data[perk.hash] = {
      appearsOn: new Set([ghostType]),
      name: perk.displayProperties.name,
      hash: Number(perk.hash),
      type,
    }
  }

  ghostArr.forEach((ghost) => {
    const modsArr = getAllFromSocket(inventoryItems, plugSets, ghost, ['ghost mods'])

    modsArr.forEach((mod) => {
      if (mod.itemTypeDisplayName?.match(/ ghost mod/i)) {
        addData(ghost, mod, 'Ghost Mod')
      }
    })
  })
}
