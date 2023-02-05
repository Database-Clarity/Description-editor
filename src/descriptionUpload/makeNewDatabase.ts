import { Database, Editor, IntermediatePerk, languageKeys } from '@icemourne/description-converter'
import _ from 'lodash'
import { store } from 'src/redux/store'
import { getLoginDetails } from 'src/utils/getLogin'

export const makeNewDatabase = (
   saveDatabaseType: 'intermediate' | 'live',
   liveDatabase: Database['perks'],
   uploadingToLive: boolean = false
) => {
   const { database, originalDatabase } = store.getState().global
   const savedDatabase = originalDatabase[saveDatabaseType]
   const modifiedDatabase = database

   const uploadInfo = {
      uploadedBy: getLoginDetails()?.username || '',
      lastUpload: Date.now()
   }

   return Object.entries(modifiedDatabase).reduce<Database['perks']>((acc, [modifiedPerkHash, modifiedPerk]) => {
      const savedPerk = savedDatabase[modifiedPerkHash]
      const livePerk = liveDatabase[modifiedPerkHash]

      // If where are no local changes return perk from live database
      const propertiesToCompare = ['editor', 'stats', 'uploadToLive', 'importStatsFrom', 'linkedWith']
      if (_.isEqual(_.pick(modifiedPerk, propertiesToCompare), _.pick(savedPerk, propertiesToCompare))) {
         acc[modifiedPerkHash] = livePerk
         return acc
      }

      // If data is going to be uploaded to live database check if perk should be updated
      if (saveDatabaseType === 'live' && modifiedPerk.uploadToLive === false && livePerk) {
         acc[modifiedPerkHash] = livePerk
         return acc
      }

      // add new perk
      if (livePerk === undefined) {
         acc[modifiedPerkHash] = { ...modifiedPerk, ...uploadInfo }
         return acc
      }

      const propertiesUserCantChange = {
         hash: Number(modifiedPerk.hash),
         itemHash: Number(modifiedPerk.itemHash),
         name: modifiedPerk.name,
         itemName: modifiedPerk.itemName,
         type: modifiedPerk.type,
      }

      const importStatsFrom =
         modifiedPerk.importStatsFrom === savedPerk.importStatsFrom
            ? livePerk.importStatsFrom
            : modifiedPerk.importStatsFrom

      const didStatsChange = !_.isEqual(modifiedPerk.stats, savedPerk.stats)

      const stats = didStatsChange ? livePerk.stats : modifiedPerk.stats
      const inLiveDatabase = uploadingToLive ? true : livePerk.inLiveDatabase
      const uploadToLive = uploadingToLive ? false : livePerk.uploadToLive

      // do same thing as in changesInEditor but with reduce and use language as key
      const changesInEditor = languageKeys.reduce((acc, language) => {
         acc[language] = !_.isEqual(modifiedPerk.editor[language], savedPerk.editor[language])
         return acc
      }, {} as { [language: string]: boolean })

      const modifiedTracker = modifiedPerk.updateTracker.descriptions
      const liveTracker = livePerk.updateTracker.descriptions
      const updateTracker = {
         stats: didStatsChange ? modifiedPerk.updateTracker.stats : livePerk.updateTracker.stats,
         descriptions: languageKeys.reduce((acc, language) => {
            acc[language] = changesInEditor[language] ? modifiedTracker[language] : liveTracker[language]
            return acc
         }, {} as IntermediatePerk['updateTracker']['descriptions'])
      }

      const editor = languageKeys.reduce((acc, language) => {
         acc[language] = changesInEditor[language] ? modifiedPerk.editor[language] : livePerk.editor[language]
         return acc
      }, {} as Editor)

      acc[modifiedPerkHash] = {
         ...modifiedPerk,
         ...propertiesUserCantChange,
         importStatsFrom,
         updateTracker,
         editor,
         stats,
         inLiveDatabase,
         uploadToLive,
         ...uploadInfo
      }
      return acc
   }, {})
}
