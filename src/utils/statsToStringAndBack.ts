import { Stat, StatNames, Stats, WeaponTypes } from '@icemourne/description-converter'
import { TypedObject, cleanObject } from '@icemourne/tool-box'

export type StringStat = {
   passive: {
      stat: string
      multiplier: string
   }
   active: {
      stat: string
      multiplier: string
   }
   /**
    * [weaponType, isUsed]
    */
   weaponTypes?: WeaponTypes[]
}

export type StringStats = {
   [key in StatNames]: StringStat[]
}

export function statsStringToArray(stringStats: StringStats): Stats {
   const stringToArray = (value: string | undefined) => {
      if (value === undefined) return []
      return value.split(',').flatMap((value) => {
         const statNumber = Number(value)
         if (value === '' || Number.isNaN(statNumber) || statNumber === 0) return []
         return statNumber
      })
   }
   const newStats = TypedObject.entries(stringStats).reduce((acc, [key, stat]) => {
      const newStat = stat.map((value) => ({
         passive: {
            stat: stringToArray(value?.passive?.stat),
            multiplier: stringToArray(value?.passive?.multiplier)
         },
         active: {
            stat: stringToArray(value?.active?.stat),
            multiplier: stringToArray(value?.active?.multiplier)
         },
         weaponTypes: value?.weaponTypes || []
      }))

      const filteredStat = newStat.flatMap((value) => {
         if (
            value.passive.stat.length === 0 &&
            value.passive.multiplier.length === 0 &&
            value.active.stat.length === 0 &&
            value.active.multiplier.length === 0
         )
            return []
         return value
      })

      acc[key] = cleanObject(filteredStat)

      return acc
   }, {} as Stats)

   return cleanObject(newStats)
}

export function statsToString(stats: Stats = {}) {
   return Object.entries(stats).reduce((acc, [key, stat]: [string, Stat[]]) => {
      acc[key as StatNames] = stat.map((value) => {
         return {
            passive: {
               stat: value?.passive?.stat?.join(', ') || '',
               multiplier: value?.passive?.multiplier?.join(', ') || ''
            },
            active: {
               stat: value?.active?.stat?.join(', ') || '',
               multiplier: value?.active?.multiplier?.join(', ') || ''
            },
            weaponTypes: value?.weaponTypes || []
         }
      })
      return acc
   }, {} as StringStats)
}
