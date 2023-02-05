import { PerkTypes } from '@icemourne/description-converter'
import { TypedObject } from '@icemourne/tool-box'
import { useEffect, useState } from 'react'
import { changePerkType, changeSelectedPerk } from 'src/redux/globalSlice'
import { useAppDispatch, useAppSelector } from 'src/redux/hooks'
import { store } from 'src/redux/store'
import { useImmer } from 'use-immer'

import { Select } from '../universal/Select'

export function DescriptionTypeSelection({
   value,
   onChange
}: {
   value: PerkTypes
   onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
}) {
   const options: { [key: string]: { [key in PerkTypes]?: string } } = {
      'Exotics': {
         'Armor Trait Exotic': 'Armor',
         'Weapon Frame Exotic': 'Weapon'
      },
      'Weapon': {
         'Weapon Trait': 'Perk',
         'Weapon Trait Origin': 'Origin Trait',
         'Weapon Trait Frame': 'Frame'
      },
      'Abilities / Subclass Options': {
         'Subclass Fragment': 'Fragment',
         'Subclass Aspect': 'Aspect',
         'Subclass Super': 'Super',
         'Subclass Grenade': 'Grenade',
         'Subclass Melee': 'Melee',
         'Subclass Class': 'Class',
         'Subclass Movement': 'Movement'
      },
      'Mods': {
         'Armor Mod General': 'Armor General',
         'Armor Mod Combat': 'Armor Combat',
         'Armor Mod Activity': 'Armor Activity',
         'Armor Mod Seasonal': 'Armor Seasonal',
         'Weapon Mod': 'Weapon',
         'Ghost Mod': 'Ghost'
      }
   }

   return (
      <Select value={value} onChange={onChange}>
         <option value="none">Select description type</option>

         {Object.keys(options).map((group, i) => (
            <optgroup label={group} key={i}>
               {TypedObject.keys(options[group]).map((option, key) => (
                  <option value={option} key={key}>
                     {options[group][option]}
                  </option>
               ))}
            </optgroup>
         ))}

         {/* <optgroup label="Exotics">
            <option value="Armor Perk Exotic">Armor</option>
            <option value="Weapon Perk Exotic">Weapon Perk</option>
            <option value="Weapon Frame Exotic">Weapon Frame</option>
            <option value="Weapon Catalyst Exotic">Catalyst</option>
         </optgroup>

         <optgroup label="Weapon">
            <option value="Weapon Perk">Perk</option>
            <option value="Weapon Perk Enhanced">Enhanced Perk</option>
            <option value="Weapon Origin Trait">Origin Trait</option>
            <option value="Weapon Frame">Frame</option>
         </optgroup>

         <optgroup label="Abilities / Subclass Options">
            <option value="Subclass Fragment">Fragment</option>
            <option value="Subclass Aspect">Aspect</option>
            <option value="Subclass Super">Super</option>
            <option value="Subclass Grenade">Grenade</option>
            <option value="Subclass Melee">Melee</option>
            <option value="Subclass Class">Class</option>
            <option value="Subclass Movement">Movement</option>
         </optgroup>

         <optgroup label="Mods">
            <option value="Armor Mod General">Armor General</option>
            <option value="Armor Mod Combat">Armor Combat</option>
            <option value="Armor Mod Activity">Armor Activity</option>
            <option value="Armor Mod Seasonal">Armor Seasonal</option>
            <option value="Weapon Mod">Weapon</option>
            <option value="Ghost Mod">Ghost</option>
         </optgroup> */}
      </Select>
   )
}

export function PerkSelection() {
   const dispatch = useAppDispatch()
   const globalState = useAppSelector((state) => state.global)

   const settings = globalState.settings
   const database = globalState.database

   // filters and sorts perks
   const [displayedPerkList, setDisplayedPerkList] = useImmer<string[]>([])
   useEffect(() => {
      const selectedPerkHashes = Object.keys(database).filter((hash) => database[hash].type === settings.selectedType)

      const sortedPerkHashes = selectedPerkHashes.sort((a, b) => {
         if (database[a].itemName && database[b].itemName) {
            return database[a].itemName!.localeCompare(database[b].itemName!)
         }
         return database[a].name.localeCompare(database[b].name)
      })

      // filter out duplicates exotic weapons
      const filteredPerkHashes =
         settings.selectedType === 'Weapon Frame Exotic'
            ? sortedPerkHashes.filter((hash, index) => {
                 if (index === 0) return true
                 return database[hash].itemName !== database[sortedPerkHashes[index - 1]].itemName
              })
            : sortedPerkHashes

      setDisplayedPerkList(filteredPerkHashes)
      dispatch(changeSelectedPerk(Number(filteredPerkHashes[0]) || 0))
   }, [settings.selectedType])

   // change selected perk with shift mouse wheel
   const [externalEvent, setExternalEvent] = useState<WheelEvent | null>(null)
   useEffect(() => {
      const changePerkEvent = (e: WheelEvent) => {
         if (!e.shiftKey) return
         e.preventDefault()
         setExternalEvent(e)
      }
      window.addEventListener('wheel', changePerkEvent, { passive: false })
   }, [externalEvent])
   useEffect(() => {
      if (externalEvent === null) return
      const currentlySelected = store.getState().global.settings.currentlySelected
      const index = Object.values(displayedPerkList).findIndex((hash) => Number(hash) === currentlySelected)

      const perkHash =
         externalEvent.deltaY < 0
            ? displayedPerkList[Math.max(index - 1, 0)]
            : displayedPerkList[Math.min(index + 1, displayedPerkList.length - 1)]

      if (perkHash) dispatch(changeSelectedPerk(Number(perkHash)))
   }, [externalEvent])

   return (
      <>
         <DescriptionTypeSelection
            value={settings.selectedType}
            onChange={(e) => dispatch(changePerkType(e.target.value as PerkTypes))}
         />
         <Select
            onChange={(e) => {
               dispatch(changeSelectedPerk(Number([e.target.value])))
            }}
            value={settings.currentlySelected}
         >
            <optgroup label="Folders">
               <option value="">something</option>
            </optgroup>
            <optgroup label="Perks">
               {displayedPerkList.map((perkHash, i) => {
                  if (database[perkHash] === undefined) return
                  return (
                     <option key={i} value={perkHash}>
                        {database[perkHash].itemName || database[perkHash].name}
                        {Number(perkHash) > 10 && (
                           <>
                              {database[perkHash].inLiveDatabase ? '' : `❌`}
                              {settings.language !== 'en' &&
                              database[perkHash].updateTracker.descriptions[settings.language]?.lastUpdate! <
                                 database[perkHash].updateTracker.descriptions.en?.lastUpdate!
                                 ? ' ⏳'
                                 : ''}
                           </>
                        )}
                     </option>
                  )
               })}
            </optgroup>
         </Select>
      </>
   )
}
