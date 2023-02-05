import { cleanObject, customJsonStringify } from '@icemourne/tool-box'
import { githubGet, githubPut } from 'src/utils/github'

import { makeNewDatabase } from './makeNewDatabase'
import { sendMessage } from 'src/utils/sendMessage'
import { store } from 'src/redux/store'
import { updateDatabase } from 'src/redux/globalSlice'

const DATABASE_PROPERTIES = ['stat', 'multiplier', 'weaponTypes', 'classNames']

export async function uploadDescriptions(location: 'intermediate' | 'live', uploadingToLive: boolean) {
   sendMessage(`Attempting upload => ${location}`)

   const oldDatabase = await githubGet(location)

   // if it's string then it is error message
   if (typeof oldDatabase === 'string') {
      sendMessage(oldDatabase, 'error')
      return
   }

   const newDatabase = makeNewDatabase(location, oldDatabase.content.perks, uploadingToLive)

   const message = await githubPut(location, {
      content: customJsonStringify(cleanObject(newDatabase), DATABASE_PROPERTIES),
      sha: oldDatabase.sha
   })

   if (typeof message === 'string') {
      sendMessage(message, 'error')
      return
   }
   sendMessage(`Uploaded => ${location}`, 'success')
   store.dispatch(updateDatabase({ databaseType: location, newDatabase }))

   if (location === 'intermediate') return
   uploadDescriptions('intermediate', uploadingToLive)
}
