import { DescriptionLine, LinesContent, RowContent } from '@icemourne/description-converter'
import { InvestmentStat } from '@icemourne/tool-box/bungieTypes/inventoryItem'
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

const InvestmentStats = ({
   statTypeName,
   perkStats
}: {
   statTypeName: string
   perkStats: InvestmentStat[] | undefined
}) => {
   const { bungie } = store.getState().global
   const bungieStatNames = bungie.stat
   return (
      <div className={styles.investmentStats}>
         {statTypeName}
         {perkStats?.map((stat, i) => {
            if(!bungieStatNames?.[stat.statTypeHash].displayProperties.name || !stat.value) return null
            return (
               <div key={i}>
                  {stat.value > 0 ? `+${stat.value}` : `${stat.value}`}{' '}
                  {bungieStatNames?.[stat.statTypeHash].displayProperties.name}
               </div>
            )
         })}
      </div>
   )
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
   const enhancedPerks = databaseSettings.enhancedPerks

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
      const folder = enhancedPerks[currentlySelected]

      const normalTraitHash = selectedPerk.type === 'Weapon Trait' ? currentlySelected : folder?.linkedWith,
         enhancedHash = selectedPerk.type === 'Weapon Trait Enhanced' ? currentlySelected : folder?.linkedWith

      const perkStats = normalTraitHash ? bungie.inventoryItem?.[normalTraitHash]?.investmentStats : undefined,
         enhancedStats = enhancedHash ? bungie.inventoryItem?.[enhancedHash]?.investmentStats : undefined

      const otherTraitStats = bungie.inventoryItem?.[currentlySelected]?.investmentStats

      return (
         <>
            {perkStats && perkStats.length !== 0 && (
               <InvestmentStats statTypeName="Perk stats:" perkStats={perkStats} />
            )}

            {enhancedStats && enhancedStats.length !== 0 && (
               <InvestmentStats statTypeName="Enhanced stats:" perkStats={enhancedStats} />
            )}

            {!perkStats && !enhancedStats && otherTraitStats && otherTraitStats.length !== 0 && (
               <InvestmentStats statTypeName={`${selectedPerk.type} stats:`} perkStats={otherTraitStats} />
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
