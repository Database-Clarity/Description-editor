import { FolderTypes, PerkTypes } from '@icemourne/description-converter'
import { TypedObject } from '@icemourne/tool-box'
import { AnyAction, Dispatch, ThunkDispatch } from '@reduxjs/toolkit'
import { useEffect, useState } from 'react'
import { changePerkType, changeSelectedPerk } from 'src/redux/globalSlice'
import { useAppDispatch, useAppSelector } from 'src/redux/hooks'
import { store } from 'src/redux/store'
import { GlobalState } from 'src/redux/types'
import { sortPerks } from 'src/utils/sortPerks'
import { Updater, useImmer } from 'use-immer'

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
         'Weapon Trait Enhanced': 'Enhanced Trait',
         'Weapon Perk': 'Perk',
         'Weapon Trait Origin': 'Origin Trait',
         'Weapon Frame': 'Frame',
         'Weapon Frame Enhanced': 'Enhanced Frame'
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
const changePerk = (displayedPerkList: string[] | number[], dispatch: DispatchType, setSelectedPerk: Updater<number>) => {
   const [externalEvent, setExternalEvent] = useState<WheelEvent | null>(null)
   useEffect(() => {
      const changePerkEvent = (e: WheelEvent) => {
         if (!e.shiftKey) return
         e.preventDefault()
         setExternalEvent(e)
      }
      const mainEditor = document.querySelector("#main-editor > div") as any
      const secondaryEditor = document.querySelector("#secondary-editor > div") as any
      window.addEventListener('wheel', changePerkEvent, { passive: false })
      mainEditor?.addEventListener('wheel', changePerkEvent, { passive: false })
      secondaryEditor?.addEventListener('wheel', changePerkEvent, { passive: false })
   }, [externalEvent])
   useEffect(() => {
      if (externalEvent === null) return
      const currentlySelected = store.getState().global.settings.currentlySelected
      const index = Object.values(displayedPerkList).findIndex((hash) => Number(hash) === currentlySelected)

      const perkHash =
         externalEvent.deltaY < 0
            ? displayedPerkList[Math.max(index - 1, 0)]
            : displayedPerkList[Math.min(index + 1, displayedPerkList.length - 1)]

      if (perkHash) {
         dispatch(changeSelectedPerk(Number(perkHash)))
         setSelectedPerk(Number(perkHash))
      }
   }, [externalEvent])
}

const PerkSelectionOptions = ({ displayedPerkList }: { displayedPerkList: string[] | number[] }) => {
   const { database, settings } = useAppSelector((state) => state.global)
   const { language } = settings

   const component = displayedPerkList.map((perkHash, i) => {
      if (database[perkHash] === undefined) return
      const perk = database[perkHash]
      const updateTracker = perk.updateTracker.descriptions
      return (
         <option key={i} value={perkHash}>
            {perk.name}
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

export const PerkSelection = () => {
   const dispatch = useAppDispatch()
   const {
      settings,
      databaseSettings: { folders }
   } = useAppSelector((state) => state.global)

   const [displayedPerkList, setDisplayedPerkList] = useImmer<string[] | number[]>([])
   const [displayedFolderList, setDisplayedFolderList] = useImmer<string[] | null>(null)
   const [selectedPerk, setSelectedPerk] = useImmer<number>(0)
   const [selectedFolder, setSelectedFolder] = useImmer<string | null>(null)

   const setDisplayedPerks = (foldersName: string) => {
      const folderPerks = folders[settings.selectedType as FolderTypes].find((folder) => folder.name === foldersName)
      setDisplayedPerkList(folderPerks?.has ?? [])
      dispatch(changeSelectedPerk(Number([folderPerks?.has[0] ?? 0])))
   }

   useEffect(() => {
      if (folders[settings.selectedType as FolderTypes]) {
         const folderNames = folders[settings.selectedType as FolderTypes].map((folder) => folder.name)
         const firstFolder = folderNames[0]
         setDisplayedFolderList(folderNames)
         setSelectedFolder(firstFolder)

         const folderPerks = folders[settings.selectedType as FolderTypes][0].has
         setDisplayedPerkList(folderPerks)
         setSelectedPerk(folderPerks[0])
         dispatch(changeSelectedPerk(folderPerks[0]))
      } else {
         const sortedPerks = sortPerks()

         setDisplayedPerkList(sortedPerks)
         setSelectedPerk(Number(sortedPerks[0]))
         dispatch(changeSelectedPerk(Number(sortedPerks[0])))

         setDisplayedFolderList(null)
         setSelectedFolder(null)
      }
   }, [settings.selectedType])

   changePerk(displayedPerkList, dispatch, setSelectedPerk)

   return (
      <>
         {displayedFolderList && selectedFolder && (
            <Select
               onChange={(e) => {
                  setSelectedFolder(e.target.value)
                  setDisplayedPerks(e.target.value)
               }}
               value={selectedFolder}
            >
               {displayedFolderList.map((folderName, i) => (
                  <option value={folderName} key={i}>
                     {folderName}
                  </option>
               ))}
            </Select>
         )}

         <Select
            onChange={(e) => {
               setSelectedPerk(Number(e.target.value))
               dispatch(changeSelectedPerk(Number([e.target.value])))
            }}
            value={selectedPerk}
         >
            <PerkSelectionOptions displayedPerkList={displayedPerkList} />
         </Select>
      </>
   )
}
