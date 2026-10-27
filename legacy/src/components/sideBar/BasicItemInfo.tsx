import { IntermediatePerk, PerkTypes } from '@icemourne/description-converter'
import _ from 'lodash'
import { useAppSelector } from 'src/redux/hooks'

import styles from './BasicItemInfo.module.scss'

export function InfoDisplayOptions({
   selectedType,
   selectedPerk
}: {
   selectedType: PerkTypes
   selectedPerk: IntermediatePerk
}) {
   switch (selectedType) {
      case 'Armor Trait Exotic':
      case 'Weapon Frame Exotic':
      case 'Weapon Catalyst Exotic':
      case 'Weapon Perk Exotic':
         return (
            <>
               <label>Item name</label>
               <span>{selectedPerk.itemName || ''}</span>
               <label>Item hash</label>
               <span>{selectedPerk.itemHash || ''}</span>
               <label>Name</label>
               <span>{selectedPerk.name}</span>
               <label>Hash</label>
               <span>{selectedPerk.hash}</span>
            </>
         )
      default:
         return (
            <>
               <label>Name</label>
               <span>{selectedPerk.name}</span>
               <label>Hash</label>
               <span>{selectedPerk.hash}</span>
            </>
         )
   }
}

export function BasicInfo() {
   const { database, settings } = useAppSelector((state) => state.global)

   const currentlySelected = settings.currentlySelected
   const selectedPerk = database[currentlySelected]

   return (
      <div className={styles.info_display}>
         <InfoDisplayOptions selectedType={settings.selectedType} selectedPerk={selectedPerk} />
      </div>
   )
}
