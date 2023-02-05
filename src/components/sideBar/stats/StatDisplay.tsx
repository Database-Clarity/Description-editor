import { TypedObject } from '@icemourne/tool-box'
import _ from 'lodash'
import { useEffect } from 'react'
import { Button } from 'src/components/universal/Button'
import { useAppSelector } from 'src/redux/hooks'
import { StringStat, statsToString } from 'src/utils/statsToStringAndBack'
import { useImmer } from 'use-immer'

import styles from './StatDisplay.module.scss'
import { StatUpdater } from './StatUpdater'

const StatValues = ({ stat, statType }: { stat: StringStat; statType: 'active' | 'passive' }) => {
   return (
      <>
         {stat?.[statType]?.stat && (
            <div className={styles.statValue}>
               <span>Stat - {statType}</span>
               <input value={stat[statType].stat} readOnly></input>
            </div>
         )}
         {stat?.[statType]?.multiplier && (
            <div className={styles.statValue}>
               <span>Multiplier - {statType}</span>
               <input value={stat[statType].multiplier} readOnly></input>
            </div>
         )}
      </>
   )
}

const StatComponent = ({ stats }: { stats: StringStat[] }) => {
   return (
      <>
         {stats
            .slice(0)
            .reverse()
            .map((stat, i) => (
               <div key={i}>
                  <div className={styles.weaponTypes}>
                     {stat.weaponTypes?.map((weaponType) => (
                        <span key={weaponType}>{`${_.upperFirst(weaponType)}`}</span>
                     ))}
                  </div>
                  <div className={styles.statValues}>
                     {stat.active && <StatValues stat={stat} statType="active" />}
                     {stat.passive && <StatValues stat={stat} statType="passive" />}
                  </div>
               </div>
            ))}
      </>
   )
}

export function NewStatSelection() {
   const { database, settings } = useAppSelector((state) => state.global)
   const { currentlySelected } = settings

   const { stats } = database[currentlySelected]
   const [statEditStatus, setStatEditStatus] = useImmer(false)

   const [displayStats, setDisplayStats] = useImmer(statsToString(stats))
   useEffect(() => setDisplayStats(statsToString(stats)), [stats])

   return (
      <div className={styles.stats}>
         <Button onClick={() => setStatEditStatus((c) => !c)}>
            {statEditStatus ? 'Close stat editor' : 'Open stat editor'}
         </Button>
         {statEditStatus && <StatUpdater />}

         {TypedObject.entries(displayStats).map(([statName, stat]) => (
            <div key={statName} className={styles.stat}>
               <div className={styles.statName}>{statName}</div>
               <StatComponent stats={stat} />
            </div>
         ))}
      </div>
   )
}
