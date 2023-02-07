import { DescriptionLine, LinesContent, RowContent } from '@icemourne/description-converter'
import { store } from 'src/redux/store'
import { useImmer } from 'use-immer'

import styles from './Description.module.scss'

const calculateStat = (formula?: string) => {
   if (formula) {
      if (/range/i.test(formula)) {
         return ` ${Math.round(Math.random() * 100)}m`
      }
      return ` ${Math.round(Math.random() * 1000)}ms`
   }
}

const otherOptions = (linesContent: LinesContent) => {
   if (linesContent?.link) return <a href={linesContent.link}>{linesContent.text}</a>
   if (linesContent?.formula)
      return (
         <>
            {linesContent.text} {calculateStat(linesContent.formula)}
         </>
      )
   return null
}

const joinClassNames = (classNames: (string | null | undefined)[] | undefined) => {
   return classNames
      ?.flatMap((className: string | null | undefined) => {
         if (className === null || className === undefined) return []
         return styles[className]
      })
      .join(' ')
}

export function DescriptionBuilder({
   description,
   addInvStats
}: {
   description: DescriptionLine[] | string
   addInvStats: boolean
}): JSX.Element {
   const { bungie, database, settings, databaseSettings } = store.getState().global
   const selectedWeaponType = settings.weaponType
   const currentlySelected = settings.currentlySelected
   const selectedPerk = database[currentlySelected]
   const folders = databaseSettings.folders

   const bungieStatNames = bungie.stat

   const [hoverPopup, setHoverPopup] = useImmer<{ [key: string]: JSX.Element }>({})

   const buildLine = (description: DescriptionLine, i: number) =>
      (description.weaponTypes?.some((weaponType) => weaponType === selectedWeaponType) ||
         description.weaponTypes === undefined) && (
         <div className={joinClassNames(description.classNames)} key={i}>
            {description?.linesContent?.map((linesContent, i) => (
               <span className={joinClassNames(linesContent?.classNames)} key={i}>
                  {linesContent?.title ? (
                     <span
                        onMouseEnter={(e) => onHover(e, linesContent.title, linesContent.text)}
                        onMouseLeave={(e) => onHover(e, linesContent.title, linesContent.text)}
                     >
                        {linesContent.text && hoverPopup[linesContent.text]}
                        {linesContent?.text}
                     </span>
                  ) : (
                     otherOptions(linesContent) || linesContent?.text
                  )}
               </span>
            ))}
         </div>
      )

   const convertTableLine = (rowContent: RowContent, i: number) => (
      <td
         key={i}
         colSpan={rowContent.colSpan}
         rowSpan={rowContent.rowSpan}
         className={joinClassNames(rowContent?.classNames)}
      >
         {rowContent.cellContent?.map((cellContent, i) => (
            <span
               className={joinClassNames(cellContent?.classNames)}
               key={i}
               onMouseEnter={cellContent?.title ? (e) => onHover(e, cellContent.title, cellContent.text) : undefined}
               onMouseLeave={cellContent?.title ? (e) => onHover(e, cellContent.title, cellContent.text) : undefined}
            >
               {cellContent.text && hoverPopup[cellContent.text]}
               {otherOptions(cellContent) || cellContent?.text}
            </span>
         ))}
      </td>
   )

   const buildTable = (lineWithTable: DescriptionLine, i: number) => (
      <table className={joinClassNames(lineWithTable?.classNames)} key={i}>
         <tbody>
            {lineWithTable?.table?.map((tableLine, i) => (
               <tr className={joinClassNames(tableLine.classNames)} key={i}>
                  {tableLine?.rowContent?.map((rowContent, i) => convertTableLine(rowContent, i))}
               </tr>
            ))}
         </tbody>
      </table>
   )

   const buildDescription = (descriptionLines: DescriptionLine[]) => {
      if (!descriptionLines || descriptionLines.length === 0) return

      return descriptionLines.map((descriptionLine: DescriptionLine, i: number) =>
         descriptionLine?.table ? buildTable(descriptionLine, i) : buildLine(descriptionLine, i)
      )
   }

   function onHover(
      e: React.MouseEvent<HTMLSpanElement, MouseEvent>,
      title: DescriptionLine[] | undefined,
      name: string | undefined
   ) {
      if (!title || !name) return
      if (e.type === 'mouseenter') {
         setHoverPopup((draft) => {
            draft[name] = <div className={styles.titleContainer}>{buildDescription(title)}</div>
         })
      }
      if (e.type === 'mouseleave') {
         setHoverPopup((draft) => {
            draft[name] = <></>
         })
      }
   }

   const investmentStats = () => {
      if (selectedPerk.type !== 'Weapon Perk' && selectedPerk.type !== 'Weapon Frame Exotic') return

      const folder = folders[currentlySelected]
      if (!folder) return

      const perkHash = database[folder.has[0]].type === 'Weapon Perk' ? folder.has[0] : folder.has[1],
         enhancedHash = database[folder.has[0]].type === 'Weapon Frame Exotic' ? folder.has[0] : folder.has[1]

      const perkStats = perkHash ? bungie.inventoryItem?.[perkHash]?.investmentStats : undefined,
         enhancedStats = enhancedHash ? bungie.inventoryItem?.[enhancedHash]?.investmentStats : undefined

      return (
         <>
            {perkStats && perkStats.length !== 0 && (
               <div className={styles.investmentStats}>
                  Perk stats:
                  {perkStats?.map((stat, i) => (
                     <div key={i}>
                        {stat.value > 0 ? `+${stat.value}` : `${stat.value}`}{' '}
                        {bungieStatNames?.[stat.statTypeHash].displayProperties.name}
                     </div>
                  ))}
               </div>
            )}

            {enhancedStats && enhancedStats.length !== 0 && (
               <div className={styles.investmentStats}>
                  Enhanced stats:
                  {enhancedStats?.map((stat, i) => (
                     <div key={i}>
                        {stat.value > 0 ? `+${stat.value}` : `${stat.value}`}{' '}
                        {bungieStatNames?.[stat.statTypeHash].displayProperties.name}
                     </div>
                  ))}
               </div>
            )}
         </>
      )
   }

   if (typeof description === 'string') {
      return <div className={styles.description}>{description}</div>
   }

   return (
      <div className={styles.description}>
         {buildDescription(description)} {addInvStats && investmentStats()}
      </div>
   )
}
