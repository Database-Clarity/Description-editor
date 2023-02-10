import { descriptionConverter, DescriptionData, descriptionFilter } from '@icemourne/description-converter'
import clsx from 'clsx'
import { useAppSelector } from 'src/redux/hooks'
import { getPerk } from 'src/redux/reducers/dataBase'

import betaDimLogo from '../../assets/betaDimLogo.png'
import clarityLogo from '../../assets/clarityLogo.png'
import { DescriptionBuilder } from './Description'
import styles from './Perks.module.scss'

export function Perks() {
   const globalState = useAppSelector((state) => state.global)
   const langue = globalState.settings.language
   const perk = getPerk()

   const perkIcon = globalState.bungie.inventoryItem?.[perk.hash]?.displayProperties?.icon

   const descriptionDataMain: DescriptionData = {
      descriptionString: perk.editor[langue]?.main || '',
      editorType: 'main',
      language: langue,
      hash: perk.hash,
      database: globalState.database
   }
   const descriptionDataSecondary: DescriptionData = {
      descriptionString: perk.editor[langue]?.secondary || '',
      editorType: 'secondary',
      language: langue,
      hash: perk.hash,
      database: globalState.database
   }

   const mainDescription = descriptionConverter(descriptionDataMain)
   const secondaryDescription = descriptionFilter(descriptionConverter(descriptionDataSecondary), 'dim')

   return (
      <div className={styles.perk_box}>
         <div className={styles.perk_list}>
            <div className={styles.description}>
               <DescriptionBuilder description={mainDescription || []} addInvStats={true} />
            </div>
            <div className={clsx(styles.perk, styles.perk_active)}>
               <div className={styles.icon_container_borderless}>
                  <img src={perkIcon ? `https://bungie.net${perkIcon}` : clarityLogo} />
               </div>
               <div className={clsx(styles.name, styles.name_active)}>{perk.name}</div>
            </div>
         </div>
         <div className={styles.perk_list}>
            <div className={styles.description}>
               <DescriptionBuilder description={secondaryDescription || []} addInvStats={false} />
            </div>
            <div className={clsx(styles.perk, styles.perk_active)}>
               <div className={styles.icon_container_borderless}>
                  <img src={betaDimLogo} />
               </div>
               <div className={clsx(styles.name, styles.name_active)}>{perk.name}</div>
            </div>
         </div>
      </div>
   )
}
