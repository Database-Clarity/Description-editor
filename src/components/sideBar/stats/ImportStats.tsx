import { PerkTypes } from '@icemourne/description-converter'
import _ from 'lodash'
import { Select } from 'src/components/universal/Select'
import { setStatImport } from 'src/redux/globalSlice'
import { useAppDispatch, useAppSelector } from 'src/redux/hooks'

type PerkWithStatsList = {
   [key in PerkTypes]: {
      hash: number
      name: string
      type: PerkTypes
   }[]
}

export const ImportStats = ({ enhanced }: { enhanced: boolean }) => {
   const { database, settings, databaseSettings } = useAppSelector((state) => state.global)
   const dispatch = useAppDispatch()

   const currentlySelected = settings.currentlySelected
   const hash = enhanced ? databaseSettings.enhancedPerks[currentlySelected]?.linkedWith : currentlySelected
   const importFrom = database[hash].importStatsFrom || 0

   const perksWithStats = Object.values(database).reduce((acc, perk) => {
      // don't include perks with out stats, custom stuff (hash 0 - 10), or hidden perks
      if (!perk.stats || perk.hash < 10) return acc
      if (!acc[perk.type]) acc[perk.type] = []

      acc[perk.type].push({
         hash: perk.hash,
         name: perk.itemName || perk.name,
         type: perk.type
      })
      return acc
   }, {} as PerkWithStatsList)

   const sortedPerksWithStats = Object.entries(perksWithStats).reduce((acc, [type, perksWithType]) => {
      acc[type as PerkTypes] = perksWithType.sort((a, b) => a.name.localeCompare(b.name))
      return acc
   }, {} as PerkWithStatsList)

   const Options = ({ groupName }: { groupName: PerkTypes }) => (
      <>
         {sortedPerksWithStats[groupName].map((perk, i) => (
            <option key={i} value={perk.hash}>
               {perk.name}
            </option>
         ))}
      </>
   )
   const Groups = () => (
      <>
         {Object.keys(sortedPerksWithStats).map((groupName, i) => (
            <optgroup key={i} label={_.startCase(groupName)}>
               <Options groupName={groupName as PerkTypes} />
            </optgroup>
         ))}
      </>
   )
   return (
      <Select
         value={importFrom}
         onChange={(e) => dispatch(setStatImport({ addImportTo: hash, importFrom: Number(e.target.value) }))}
      >
         <option value={0}>Import stats (optional)</option>
         <Groups />
      </Select>
   )
}
