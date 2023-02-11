import _ from 'lodash'
import { Fragment, useEffect } from 'react'
import { Button } from 'src/components/universal/Button'
import { VerticalDivider } from 'src/components/universal/VerticalDivider'
import { useAppSelector } from 'src/redux/hooks'
import { StringStat, statsToString } from 'src/utils/statsToStringAndBack'
import { useImmer } from 'use-immer'

import { ImportStats } from './ImportStats'
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
   const { database, settings, databaseSettings } = useAppSelector((state) => state.global)
   const { currentlySelected } = settings
   const { enhancedPerks } = databaseSettings

   const { stats, importStatsFrom } = database[currentlySelected]
   const linkedPerk = database[enhancedPerks[currentlySelected]?.linkedWith || '']
   const importedStats = importStatsFrom ? database[importStatsFrom]?.stats : undefined
   const importedStatsOnLinked = linkedPerk?.importStatsFrom
      ? database[linkedPerk?.importStatsFrom || '']?.stats
      : undefined

   const [statEditStatus, setStatEditStatus] = useImmer(false)
   const [linkedStatEditStatus, setLinkedStatEditStatus] = useImmer(false)

   const [displayStats, setDisplayStats] = useImmer(statsToString(stats))
   useEffect(() => setDisplayStats(statsToString(stats)), [stats])

   const [linkedDisplayStats, setLinkedDisplayStats] = useImmer(statsToString(stats))
   useEffect(() => setLinkedDisplayStats(statsToString(linkedPerk?.stats)), [linkedPerk?.stats])

   const buttons = [
      !linkedStatEditStatus && (
         <Button onClick={() => setStatEditStatus((c) => !c)} buttonStatus={statEditStatus} key="button1">
            {statEditStatus ? 'Close stat editor' : 'Open stat editor'}
         </Button>
      ),
      !statEditStatus && enhancedPerks[currentlySelected] && (
         <Button onClick={() => setLinkedStatEditStatus((c) => !c)} buttonStatus={linkedStatEditStatus} key="button2">
            {linkedStatEditStatus ? 'Close linked perk stat editor' : 'Open linked perk stat editor'}
         </Button>
      )
   ]

   const statUpdaters = [
      statEditStatus && <StatUpdater enhanced={false} key="statUpdater1" />,
      linkedStatEditStatus && <StatUpdater enhanced={true} key="statUpdater2" />
   ]

   const importStats = [
      statEditStatus && <ImportStats enhanced={false} key="statImport1" />,
      linkedStatEditStatus && <ImportStats enhanced={true} key="statImport2" />
   ]

   const statsDisplay = [
      Object.entries(displayStats).map(([statName, stat]) => (
         <div key={statName} className={styles.stat}>
            <div className={styles.statName}>{statName}</div>
            <StatComponent stats={stat} />
         </div>
      )),
      importedStats && (
         <Fragment key="import1">
            <div className={styles.importLabel}>{`Imported stats from\n${database[importStatsFrom!].name}`}</div>
            {Object.entries(statsToString(importedStats)).map(([statName, stat]) => (
               <div key={statName} className={styles.stat}>
                  <div className={styles.statName}>{statName}</div>
                  <StatComponent stats={stat} />
               </div>
            ))}
         </Fragment>
      ),
      linkedPerk?.stats && (
         <>
            <VerticalDivider key="divider" />
            <div className={styles.importLabel} key="linkedPerk">
               Linked perk info
            </div>
         </>
      ),
      Object.entries(linkedDisplayStats).map(([statName, stat]) => (
         <div key={statName + 1} className={styles.stat}>
            <div className={styles.statName}>{statName}</div>
            <StatComponent stats={stat} />
         </div>
      )),
      importedStatsOnLinked && (
         <Fragment key="import2">
            <div className={styles.importLabel}>{`Imported stats from\n${
               database[linkedPerk.importStatsFrom!].name
            }`}</div>
            {Object.entries(statsToString(importedStatsOnLinked)).map(([statName, stat]) => (
               <div key={statName} className={styles.stat}>
                  <div className={styles.statName}>{statName}</div>
                  <StatComponent stats={stat} />
               </div>
            ))}
         </Fragment>
      )
   ]

   return (
      <div className={styles.stats}>
         {buttons}
         {statUpdaters}
         {importStats}
         {statsDisplay}
      </div>
   )
}
