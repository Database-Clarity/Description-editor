import { PerkTypes } from '@icemourne/description-converter'
import { TypedObject } from '@icemourne/tool-box'
import { AnyAction, Dispatch, ThunkDispatch } from '@reduxjs/toolkit'
import { useEffect, useState } from 'react'
import { changePerkType, changeSelectedPerk } from 'src/redux/globalSlice'
import { useAppDispatch, useAppSelector } from 'src/redux/hooks'
import { store } from 'src/redux/store'
import { GlobalState } from 'src/redux/types'
import { sortPerks } from 'src/utils/sortPerks'
import { useImmer } from 'use-immer'

import { Select } from '../universal/Select'

export function DescriptionTypeSelection() {
   const dispatch = useAppDispatch()
   const { settings } = useAppSelector((state) => state.global)

   const options: { [key: string]: { [key in PerkTypes]?: string } } = {
      'Exotics': {
         'Armor Trait Exotic': 'Armor',
         'Weapon Frame Exotic': 'Weapon'
      },
      'Weapon': {
         'Weapon Trait': 'Trait',
         'Weapon Perk': 'Perk',
         'Weapon Trait Origin': 'Origin Trait',
         'Weapon Frame': 'Frame'
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
      <Select value={settings.selectedType} onChange={(e) => dispatch(changePerkType(e.target.value as PerkTypes))}>
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
      </Select>
   )
}

// change selected perk with shift mouse wheel
type DispatchType = ThunkDispatch<{ global: GlobalState }, undefined, AnyAction> & Dispatch<AnyAction>
const changePerk = (displayedPerkList: string[], dispatch: DispatchType) => {
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
}

const PerkSelectionOptions = ({
   displayedPerkList,
   isFolder = false
}: {
   displayedPerkList: string[] | number[]
   isFolder?: boolean
}) => {
   const { database, settings } = useAppSelector((state) => state.global)
   const { language } = settings

   const component = displayedPerkList.map((perkHash, i) => {
      if (database[perkHash] === undefined) return
      const perk = database[perkHash]
      const updateTracker = perk.updateTracker.descriptions
      return (
         <option key={i} value={perkHash}>
            {isFolder ? perk.name : perk.itemName || perk.name}
            {isFolder && perk.type === 'Weapon Trait Enhanced' ? ' (Enhanced)' : ''}
            {Number(perkHash) > 10 && (
               <>
                  {perk.inLiveDatabase ? '' : `❌`}
                  {language !== 'en' && updateTracker[language]?.lastUpdate! < updateTracker.en?.lastUpdate!
                     ? ' ⏳'
                     : ''}
               </>
            )}
         </option>
      )
   })

   return <>{component}</>
}

const FolderContentSelection = ({ selectedPerk }: { selectedPerk: number }) => {
   const dispatch = useAppDispatch()
   const { database, settings, databaseSettings } = useAppSelector((state) => state.global)
   const folders = databaseSettings.folders
   if (!database[selectedPerk]) return null

   const folder = folders[selectedPerk]

   if (!folder) return null

   return (
      <Select
         onChange={(e) => {
            dispatch(changeSelectedPerk(Number([e.target.value])))
         }}
         value={settings.currentlySelected}
      >
         <PerkSelectionOptions displayedPerkList={folder?.has} isFolder={true} />
      </Select>
   )
}

export function PerkSelection() {
   const dispatch = useAppDispatch()
   const { settings } = useAppSelector((state) => state.global)

   // filters and sorts perks
   const [displayedPerkList, setDisplayedPerkList] = useImmer<string[]>([])
   const [selectedPerk, setSelectedPerk] = useImmer<number>(0)

   useEffect(() => {
      const sortedPerks = sortPerks()
      setDisplayedPerkList(sortedPerks)
      setSelectedPerk(Number(sortedPerks[0]))
   }, [settings.selectedType])

   changePerk(displayedPerkList, dispatch)

   return (
      <>
         <Select
            onChange={(e) => {
               dispatch(changeSelectedPerk(Number([e.target.value])))
               setSelectedPerk(Number([e.target.value]))
            }}
            value={selectedPerk}
         >
            <PerkSelectionOptions displayedPerkList={displayedPerkList} />
         </Select>
         <FolderContentSelection selectedPerk={selectedPerk} />
      </>
   )
}
