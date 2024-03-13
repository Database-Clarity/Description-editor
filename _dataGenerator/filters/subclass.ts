import type { InventoryItems, PlugSets } from '@tips/bungieTypes/manifest'

import type { InventoryItem } from '@tips/bungieTypes/inventoryItem'
import type { PerkDataList } from '_dataGenerator/main'
import type { PerkTypes } from '@tips/types'
import { getAllFromSocket } from '_dataGenerator/utils/getAllFromSocket'

export const subclass = (inventoryItems: InventoryItems, plugSets: PlugSets, data: PerkDataList) => {
  const subclassArr = Object.values(inventoryItems).filter((item) => item.itemType === 16 && item.sockets !== undefined)

  const addData = (subclass: InventoryItem, perk: InventoryItem, type: PerkTypes) => {
    const subclassType = subclass.itemTypeDisplayName
    if (subclassType === undefined) return

    if (data[perk.hash] !== undefined) {
      data[perk.hash].appearsOn.add(subclassType)
      return
    }

    data[perk.hash] = {
      appearsOn: new Set([subclassType]),
      name: perk.displayProperties.name,
      hash: Number(perk.hash),
      type,
    }
  }

  subclassArr.forEach((subclass) => {
    // if (subclass.hash === 2842471112) debugger

    const abilityArr = getAllFromSocket(inventoryItems, plugSets, subclass, ['abilities'])
    const superArr = getAllFromSocket(inventoryItems, plugSets, subclass, ['super'])
    const aspectArr = getAllFromSocket(inventoryItems, plugSets, subclass, ['aspects'])
    const fragmentsArr = getAllFromSocket(inventoryItems, plugSets, subclass, ['fragments'])

    abilityArr.forEach((perk) => {
      if (perk.itemTypeDisplayName?.includes('Melee')) {
        addData(subclass, perk, 'Subclass Melee')
        return
      }
      if (perk.itemTypeDisplayName?.includes('Grenade')) {
        addData(subclass, perk, 'Subclass Grenade')
        return
      }
      if (perk.itemTypeDisplayName === 'Movement Ability') {
        addData(subclass, perk, 'Subclass Movement')
        return
      }
      if (perk.itemTypeDisplayName === 'Class Ability') {
        addData(subclass, perk, 'Subclass Class')
      }
    })

    superArr.forEach((perk) => {
      if (perk.itemTypeDisplayName === 'Super Ability') {
        addData(subclass, perk, 'Subclass Super')
      }
    })

    aspectArr.forEach((perk) => {
      if (perk.itemTypeDisplayName?.includes('Aspect')) {
        addData(subclass, perk, 'Subclass Aspect')
      }
    })

    fragmentsArr.forEach((perk) => {
      if (perk.itemTypeDisplayName?.includes('Fragment')) {
        addData(subclass, perk, 'Subclass Fragment')
      }
    })
  })
}
