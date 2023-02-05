import { Database } from '@icemourne/description-converter'
import { cleanObject, customJsonStringify } from '@icemourne/tool-box'
import { updateDatabase } from 'src/redux/globalSlice'
import { store } from 'src/redux/store'
import { githubGet, githubPut } from 'src/utils/github'
import { sendMessage } from 'src/utils/sendMessage'

import { makeNewDatabase } from './makeNewDatabase'

const DATABASE_PROPERTIES = ['stat', 'multiplier', 'weaponTypes', 'classNames']

export async function uploadDescriptions(location: 'intermediate' | 'live', uploadingToLive: boolean) {
   sendMessage(`Attempting upload => ${location}`)

   const oldDatabase = await githubGet(location)

   // if it's string then it is error message
   if (typeof oldDatabase === 'string') {
      sendMessage(oldDatabase, 'error')
      return
   }

   const newDatabase: Database = {
      perks: makeNewDatabase(location, oldDatabase.content.perks, uploadingToLive),
      databaseSettings: oldDatabase.content.databaseSettings
   }

   const message = await githubPut(location, {
      content: customJsonStringify(cleanObject(newDatabase), DATABASE_PROPERTIES),
      sha: oldDatabase.sha
   })

   if (typeof message === 'string') {
      sendMessage(message, 'error')
      return
   }
   sendMessage(`Uploaded => ${location}`, 'success')
   store.dispatch(updateDatabase({ databaseType: location, newDatabase: newDatabase.perks }))

   if (location === 'intermediate') return
   uploadDescriptions('intermediate', uploadingToLive)
}
