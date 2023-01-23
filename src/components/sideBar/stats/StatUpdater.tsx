import { ChangeEvent, useEffect } from 'react'
import { StatNames, WeaponTypes, statNames, weaponTypes } from '@icemourne/description-converter'
import { StringStat, StringStats, statsStringToArray, statsToString } from 'src/utils/statsToStringAndBack'
import { Updater, useImmer } from 'use-immer'
import { useAppDispatch, useAppSelector } from 'src/redux/hooks'

import { Button } from 'src/components/universal/Button'
import { TypedObject } from '@icemourne/tool-box'
import _ from 'lodash'
import clsx from 'clsx'
import styles from './StatUpdater.module.scss'
import { updateStats } from 'src/redux/globalSlice'

const StatValues = ({
   stat,
   setDisplayStats,
   statType,
   path
}: {
   stat: StringStat
   setDisplayStats: Updater<StringStats>
   statType: 'active' | 'passive'
   path: [StatNames, number]
}) => {
   const updateStat = (event: ChangeEvent<HTMLInputElement>, location: 'stat' | 'multiplier') => {
      setDisplayStats((stringStats) => {
         _.set(stringStats, [...path, statType, location], event.target.value)
      })
   }

   return (
      <>
         <div className={styles.statValue}>
            <span>Stat - {statType}</span>
            <input value={stat?.[statType]?.stat || ''} onChange={(e) => updateStat(e, 'stat')}></input>
         </div>

         <div className={styles.statValue}>
            <span>Multiplier - {statType}</span>
            <input value={stat?.[statType]?.multiplier || ''} onChange={(e) => updateStat(e, 'multiplier')}></input>
         </div>
      </>
   )
}

const WeaponTypesComponent = ({
   stat,
   setDisplayStats,
   path,
   usedWeaponTypes
}: {
   stat: StringStat
   setDisplayStats: Updater<StringStats>
   path: [StatNames, number]
   usedWeaponTypes: WeaponTypes[]
}) => {
   const addRemoveWeaponType = (weaponType: WeaponTypes) => {
      setDisplayStats((stringStats) => {
         const weaponTypes: WeaponTypes[] = _.get(stringStats, [...path, 'weaponTypes'])

         // prevent usage of already used weapon types
         if (usedWeaponTypes.includes(weaponType) && !weaponTypes?.includes(weaponType)) return

         // add remove weapon type
         if (weaponTypes?.includes(weaponType)) {
            _.set(
               stringStats,
               [...path, 'weaponTypes'],
               weaponTypes.filter((type) => type !== weaponType)
            )
         } else {
            _.set(stringStats, [...path, 'weaponTypes'], [...weaponTypes, weaponType])
         }
      })
   }

   return (
      <div className={styles.weaponTypes}>
         {weaponTypes.map((weaponType, i) => (
            <span
               key={i}
               onClick={() => addRemoveWeaponType(weaponType)}
               className={clsx(
                  stat.weaponTypes?.includes(weaponType) && styles.active,
                  usedWeaponTypes.includes(weaponType) && styles.used
               )}
            >{`${_.upperFirst(weaponType)}`}</span>
         ))}
      </div>
   )
}

const stringStat: StringStat = {
   active: { stat: '', multiplier: '' },
   passive: { stat: '', multiplier: '' },
   weaponTypes: []
}

const StatComponent = ({
   stats,
   setDisplayStats,
   statName
}: {
   stats: StringStat[]
   setDisplayStats: Updater<StringStats>
   statName: StatNames
}) => {
   const usedWeaponTypes: WeaponTypes[] = []

   const addStatBlock = () => {
      setDisplayStats((stringStats) => {
         _.set(stringStats, [statName], [...stats, stringStat])
      })
   }
   const removeStatBlock = () => {
      setDisplayStats((stringStats) => {
         _.set(stringStats, [statName], _.dropRight(stats))
      })
   }

   return (
      <div className={styles.statBlocks}>
         {stats.map((stat, i) => {
            usedWeaponTypes.push(...usedWeaponTypes, ...(stat.weaponTypes || []))
            return (
               <div key={i} className={styles.statBlock}>
                  <WeaponTypesComponent
                     stat={stat}
                     setDisplayStats={setDisplayStats}
                     path={[statName, i]}
                     usedWeaponTypes={usedWeaponTypes}
                  />
                  <div className={styles.statValues}>
                     <StatValues stat={stat} setDisplayStats={setDisplayStats} statType="active" path={[statName, i]} />
                     <StatValues
                        stat={stat}
                        setDisplayStats={setDisplayStats}
                        statType="passive"
                        path={[statName, i]}
                     />
                  </div>
               </div>
            )
         })}
         <div className={styles.addRemoveStatBlock}>
            <img onClick={addStatBlock} src="https://img.icons8.com/glyph-neue/64/e9a735/plus-2-math.png" />
            {stats.length > 1 && (
               <img onClick={removeStatBlock} src="https://img.icons8.com/glyph-neue/64/e9a735/minus-2-math.png" />
            )}
         </div>
      </div>
   )
}

export const StatUpdater = () => {
   const dispatch = useAppDispatch()

   const { database, settings } = useAppSelector((state) => state.global)
   const { currentlySelected } = settings

   const { linkedWith, stats } = database[currentlySelected]

   const [displayStats, setDisplayStats] = useImmer(statsToString(stats))
   useEffect(() => setDisplayStats(statsToString(stats)), [stats])

   const usedStats = TypedObject.entries(displayStats).map(([statName]) => statName)
   const unusedStats = statNames.filter((statName) => !usedStats.includes(statName))

   const addStat = (statName: StatNames) => {
      setDisplayStats((stringStats) => {
         _.set(stringStats, [statName], [stringStat])
      })
   }
   const removeStat = (statName: StatNames) => {
      setDisplayStats((stringStats) => {
         _.unset(stringStats, [statName])
      })
   }
   const saveStatChanges = () => {
      dispatch(updateStats({ hash: currentlySelected, stats: statsStringToArray(displayStats) }))
   }

   return (
      <>
         <Button onClick={saveStatChanges}>Save stat changes</Button>
         <div className={styles.statUpdater}>
            {TypedObject.entries(displayStats).map(([statName, stat]) => (
               <div key={statName} className={styles.stat}>
                  <div className={styles.statName} onClick={() => removeStat(statName)}>
                     {statName}
                  </div>
                  <StatComponent stats={stat} setDisplayStats={setDisplayStats} statName={statName} />
               </div>
            ))}
            <div>
               {unusedStats.map((statName) => (
                  <div key={statName} className={styles.statName} onClick={() => addStat(statName)}>
                     {statName}
                  </div>
               ))}
            </div>
         </div>
      </>
   )
}
