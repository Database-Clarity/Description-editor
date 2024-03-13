import type { InventoryItems, PlugSets } from '@tips/bungieTypes/manifest'

import type { InventoryItem } from '@tips/bungieTypes/inventoryItem'
import type { PerkDataList } from '_dataGenerator/main'
import type { PerkTypes } from '@tips/types'
import { getAllFromSocket } from '_dataGenerator/utils/getAllFromSocket'

export const legendaryWeapons = (inventoryItems: InventoryItems, plugSets: PlugSets, data: PerkDataList) => {
  const weaponArr = Object.values(inventoryItems).filter(
    (item) => item.itemType === 3 && item.itemTypeAndTierDisplayName?.includes('Legendary')
  )

  const addData = (weapon: InventoryItem, perk: InventoryItem, type: PerkTypes, frameArr?: InventoryItem[]) => {
    const weaponType = weapon.itemTypeDisplayName
    if (weaponType === undefined) return

    if (data[perk.hash] !== undefined) {
      data[perk.hash].appearsOn.add(weaponType)
      data[perk.hash].linkedWith = [
        ...new Set([...(data[perk.hash].linkedWith ?? []), ...(frameArr?.map((frame) => frame.hash) ?? [])]),
      ]
      data[perk.hash].type = type
      return
    }

    data[perk.hash] = {
      appearsOn: new Set([weaponType]),
      name: perk.displayProperties.name,
      hash: Number(perk.hash),
      type,
      linkedWith: frameArr?.map((frame) => frame.hash) ?? [],
    }
  }

  weaponArr.forEach((weapon) => {
    const frameArr = getAllFromSocket(inventoryItems, plugSets, weapon, ['weapon frame'])
    const perkArr = getAllFromSocket(inventoryItems, plugSets, weapon, ['weapon perks'])
    const modArr = getAllFromSocket(inventoryItems, plugSets, weapon, ['weapon mods'])

    frameArr.forEach((frame) => {
      if (frame.itemTypeDisplayName === 'Intrinsic') {
        addData(weapon, frame, 'Weapon Frame', frameArr)
        return
      }
      if (frame.itemTypeDisplayName === 'Enhanced Intrinsic') {
        addData(weapon, frame, 'Weapon Frame Enhanced', frameArr)
      }
    })

    perkArr.forEach((perk) => {
      switch (perk.itemTypeDisplayName) {
        case 'Trait':
          addData(weapon, perk, 'Weapon Trait')
          break
        case 'Origin Trait':
          addData(weapon, perk, 'Weapon Trait Origin')
          break
        case 'Enhanced Trait':
          addData(weapon, perk, 'Weapon Trait Enhanced')
          break
        default:
          addData(weapon, perk, 'Weapon Perk')
          break
      }
    })

    modArr.forEach((mod) => {
      if (mod.itemTypeDisplayName === 'Weapon Mod') {
        addData(weapon, mod, 'Weapon Mod')
      }
    })
  })
}
