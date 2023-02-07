import { WeaponTypes, weaponTypes } from '@icemourne/description-converter'
import { useEffect, useState } from 'react'
import specialAmmo from 'src/assets/specialAmmo.png'
import { changePerkType, changeSelectedPerk, changeWeaponType } from 'src/redux/globalSlice'
import { useAppDispatch, useAppSelector } from 'src/redux/hooks'
import { cnc } from 'src/utils/classNameCombiner'

import styles from './Header.module.scss'

const itemPreview = {
   ammo: {
      img: 'https://bungie.net/common/destiny2_content/icons/b6d3805ca8400272b7ee7935b0b75c79.png',
      type: 'special'
   },
   breaker: {
      img: 'https://www.bungie.net/common/destiny2_content/icons/DestinyBreakerTypeDefinition_825a438c85404efd6472ff9e97fc7251.png',
      type: 'special'
   },
   element: {
      img: 'https://www.bungie.net/common/destiny2_content/icons/DestinyDamageTypeDefinition_530c4c3e7981dc2aefd24fd3293482bf.png',
      type: 'special'
   },
   power: __APP_VERSION__,
   name: `STARDUST'S BURDEN`
}
const WeaponSelection = () => {
   const dispatch = useAppDispatch()
   const [weaponTypeIndex, setWeaponTypeIndex] = useState<number>(0)

   const onWheelOverWeaponType = (e: React.WheelEvent<HTMLSelectElement>) => {
      const wheelDirection = e.deltaY < 0 ? -1 : 1
      setWeaponTypeIndex((current) => Math.min(Math.max(current + wheelDirection, 0), weaponTypes.length - 1))
   }

   useEffect(() => {
      dispatch(changeWeaponType(weaponTypes[weaponTypeIndex]))
   }, [weaponTypeIndex])

   const onTypeSelection = (weaponType: WeaponTypes) => {
      setWeaponTypeIndex(weaponTypes.findIndex((t) => t === weaponType))
   }
   return (
      <select
         onWheel={(e) => onWheelOverWeaponType(e)}
         onChange={(e) => onTypeSelection(e.target.value as WeaponTypes)}
         value={weaponTypes[weaponTypeIndex]}
         className={styles.type}
      >
         {weaponTypes.map((weaponType, i) => (
            <option value={weaponType} key={i}>
               {weaponType}
            </option>
         ))}
      </select>
   )
}

export function Header() {
   const dispatch = useAppDispatch()
   const { database, settings, databaseSettings } = useAppSelector((state) => state.global)
   const folders = databaseSettings.folders
   const currentlySelectedPerk = database[settings.currentlySelected]

   const onPerksTypeSwitch = () => {
      const folder = folders[currentlySelectedPerk.hash]
      if (!folder) return
      const currentPerkIndexInFolder = folder.has.findIndex((hash) => hash === currentlySelectedPerk.hash)
      const nextPerkHash = folder.has[currentPerkIndexInFolder + 1] || folder.has[0]

      const nextPerk = database[nextPerkHash]

      dispatch(changePerkType(nextPerk.type))
      setTimeout(() => {
         dispatch(changeSelectedPerk(nextPerk.hash))
      })
   }

   const left = (
      <div className={styles.left}>
         <WeaponSelection />
         {itemPreview.ammo.img && <img className={styles.ammo} src={specialAmmo} />}
         {itemPreview.breaker.img && <img className={styles.breaker} src={itemPreview.breaker.img} />}
      </div>
   )
   const right = (
      <div className={styles.right}>
         {itemPreview.element?.img && <img className={styles.element} src={itemPreview.element.img} />}
         <div className={styles.power}>{itemPreview.power}</div>
      </div>
   )

   return (
      <div className={styles.header}>
         <a
            className={cnc(styles.name, currentlySelectedPerk.type === 'Weapon Trait Enhanced', styles.enhancedName)}
            onClick={onPerksTypeSwitch}
         >
            {itemPreview.name}
         </a>
         <div className={styles.bottom}>
            {left}
            {right}
         </div>
      </div>
   )
}
