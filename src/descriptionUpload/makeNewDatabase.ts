import { Database, Editor, IntermediatePerk, languageKeys, statNames } from '@icemourne/description-converter'
import _ from 'lodash'
import { store } from 'src/redux/store'
import { getLoginDetails } from 'src/utils/getLogin'

const comparePerks = (modifiedPerk: IntermediatePerk, savedPerk: IntermediatePerk) => {
   const propertiesToCompare = ['editor', 'stats', 'uploadToLive', 'importStatsFrom']
   return _.isEqual(_.pick(modifiedPerk, propertiesToCompare), _.pick(savedPerk, propertiesToCompare))
}

const useLivePerk = (
   databaseType: 'intermediate' | 'live',
   modifiedPerk: IntermediatePerk,
   livePerk: IntermediatePerk
) => {
   if (databaseType === 'intermediate') return false
   if (livePerk === undefined) return false
   return !modifiedPerk.uploadToLive
}

const compareProperty = <M, S, L>(saved: S, modified: M, live: L) => {
   if (modified === undefined) return undefined
   return _.isEqual(saved, modified) ? live : modified
}

const updateEditor = (savedEditor: Editor, modifiedEditor: Editor, liveEditor: Editor) => {
   return languageKeys.reduce<Editor>((acc, language) => {
      const savedMain = savedEditor[language]?.main,
         savedSecondary = savedEditor[language]?.secondary
      const modifiedMain = modifiedEditor[language]?.main,
         modifiedSecondary = modifiedEditor[language]?.secondary
      const liveMain = liveEditor[language]?.main,
         liveSecondary = liveEditor[language]?.secondary

      if (modifiedMain === undefined || modifiedSecondary === undefined) return acc
      if (modifiedMain.trim() === '' && modifiedSecondary.trim() === '' && language !== 'en') return acc

      acc[language] = {
         main: compareProperty(savedMain, modifiedMain, liveMain) || '',
         secondary: compareProperty(savedSecondary, modifiedSecondary, liveSecondary) || ''
      }
      return acc
   }, {})
}

const updateUpdateTracker = (
   savedPerk: IntermediatePerk,
   modifiedPerk: IntermediatePerk,
   livePerk: IntermediatePerk
) => {
   const { editor: savedEditor, stats: savedStats } = savedPerk
   const { updateTracker: modifiedTracker, editor: modifiedEditor, stats: modifiedStats } = modifiedPerk
   const { updateTracker: liveTracker } = livePerk

   const descriptionTracker = languageKeys.reduce<IntermediatePerk['updateTracker']['descriptions']>(
      (acc, language) => {
         const savedMain = savedEditor[language]?.main,
            savedSecondary = savedEditor[language]?.secondary
         const modifiedMain = modifiedEditor[language]?.main,
            modifiedSecondary = modifiedEditor[language]?.secondary

         if (modifiedMain === undefined || modifiedSecondary === undefined) return acc
         const descriptionChanged = modifiedMain !== savedMain || modifiedSecondary !== savedSecondary

         acc[language] = descriptionChanged
            ? modifiedTracker.descriptions[language]
            : liveTracker.descriptions[language]
         return acc
      },
      {}
   )

   const statsTracker = _.isEqual(savedStats, modifiedStats)
   return {
      descriptions: descriptionTracker,
      stats: statsTracker ? liveTracker.stats : modifiedTracker.stats
   }
}

const removeDeprecatedStats = (perk: IntermediatePerk) => {
   return {
      ...perk,
      stats: _.pick(perk.stats, statNames)
   }
}

export const makeNewDatabase = (
   databaseType: 'intermediate' | 'live',
   liveDatabase: Database['perks'],
   uploadingToLive: boolean = false
) => {
   const { database, originalDatabase } = store.getState().global
   const savedDatabase = originalDatabase[databaseType]
   const modifiedDatabase = database

   const uploadInfo = {
      uploadedBy: getLoginDetails()?.username || '',
      lastUpload: Date.now()
   }

   return Object.keys(modifiedDatabase).reduce<Database['perks']>((acc, modifiedPerkHash) => {
      const savedPerk = savedDatabase[modifiedPerkHash]
      const livePerk = liveDatabase[modifiedPerkHash]
      const modifiedPerk = removeDeprecatedStats(modifiedDatabase[modifiedPerkHash])

      // add new perk
      if (livePerk === undefined) {
         acc[modifiedPerkHash] = { ...modifiedPerk, ...uploadInfo }
         return acc
      }

      // If where are no local changes return perk from live database
      if (comparePerks(savedPerk, modifiedPerk)) {
         acc[modifiedPerkHash] = livePerk
         return acc
      }

      // If data is going to be uploaded to live database check if perk should be updated
      if (useLivePerk(databaseType, modifiedPerk, livePerk)) {
         acc[modifiedPerkHash] = livePerk
         return acc
      }

      acc[modifiedPerkHash] = {
         name: modifiedPerk.name,
         itemName: modifiedPerk.itemName,
         hash: Number(modifiedPerk.hash),
         itemHash: Number(modifiedPerk.itemHash) || undefined,
         type: modifiedPerk.type,

         stats: compareProperty(savedPerk.stats, modifiedPerk.stats, livePerk.stats),
         importStatsFrom: compareProperty(
            savedPerk.importStatsFrom,
            modifiedPerk.importStatsFrom,
            livePerk.importStatsFrom
         ),

         editor: updateEditor(savedPerk.editor, modifiedPerk.editor, livePerk.editor),
         updateTracker: updateUpdateTracker(savedPerk, modifiedPerk, livePerk),

         uploadedBy: uploadInfo.uploadedBy,
         lastUpload: uploadInfo.lastUpload,
         inLiveDatabase: uploadingToLive && modifiedPerk.uploadToLive,
         uploadToLive: uploadingToLive ? false : livePerk.uploadToLive
      }
      return acc
   }, {})
}
