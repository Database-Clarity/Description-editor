import { Database, IntermediatePerk } from '@icemourne/description-converter'
import { persistentFetch } from '@icemourne/tool-box'
import { decode, encode } from 'js-base64'
import { defaultPerk } from 'src/data/randomData'
import { apiUrlsV2 } from 'src/data/urls'

import { getLoginDetails } from './getLogin'

export type DataToSend = {
   sha: string
   content: string
}
export type GithubJsonResponse = {
   content: string
   sha: string
}

export type GithubGetResponse = {
   content: Database
   sha: string
}

export async function githubGet(location: keyof typeof apiUrlsV2): Promise<GithubGetResponse | string> {
   const url = apiUrlsV2[location].url + `?ref=${apiUrlsV2[location].branch}`
   const login = getLoginDetails()
   if (login === null) {
      return 'Login details missing'
   }

   const resp = await persistentFetch<any>(url, 5, {
      method: 'GET',
      mode: 'cors',
      headers: {
         authorization: `token ${decode(login.password)}`,
         accept: 'application/vnd.github+json'
      }
   })

   if (resp.error) {
      return resp.error.message
   }

   const respJson: GithubJsonResponse = resp

   // if content is empty it means file is over 1MB in size and it has to be downloaded as raw
   if (respJson.content.trim() === '') {
      const rawResp = await persistentFetch<any>(url + '&cache=buster', 5, {
         method: 'GET',
         mode: 'cors',
         headers: {
            authorization: `token ${decode(login.password)}`,
            accept: 'application/vnd.github.raw+json'
         }
      })

      if (rawResp.error) {
         return rawResp.error.message
      }

      return {
         content: rawResp,
         sha: respJson.sha
      }
   }

   return {
      content: JSON.parse(decode(respJson.content)),
      sha: respJson.sha
   }
}

export async function githubPut(location: keyof typeof apiUrlsV2, data: DataToSend): Promise<true | string> {
   const api = apiUrlsV2[location]
   const login = getLoginDetails()
   if (login === null) {
      return 'Login details missing'
   }

   const resp = await persistentFetch<any>(api.url, 5, {
      method: 'PUT',
      mode: 'cors',
      headers: {
         authorization: `token ${decode(login.password)}`,
         accept: 'application/vnd.github+json'
      },
      body: JSON.stringify({
         sha: data.sha,
         branch: api.branch,
         message: `Updated by ${login.username}`,
         content: encode(`${data.content}\n`)
      })
   })

   if (resp.error) {
      return resp.error.message
   }
   return true
}

const unauthorized = async (location: keyof typeof apiUrlsV2): Promise<any> => {
   const { raw } = apiUrlsV2[location]
   const resp = await persistentFetch<any>(raw, 3)
   if (resp === Error) {
      return resp.message
   }
   return resp
}

export async function getStartUpDescriptions() {
   const intermediateResp = unauthorized('intermediate'),
      dataGeneratorResp = unauthorized('dataGenerator'),
      liveResp = unauthorized('live')

   const intermediate: Database = await intermediateResp,
      dataGenerator: Database = await dataGeneratorResp,
      live: Database = await liveResp

   const updatedIntermediate = Object.entries(dataGenerator.perks).reduce<{[key: string]: IntermediatePerk}>((acc, [key, value]) => {
      acc[key] = {
         ...(intermediate.perks[key] || defaultPerk),
         ...{
            hash: value.hash,
            name: value.name,
            itemHash: value.itemHash,
            itemName: value.itemName,
            type: value.type,
         }
      }
      // add custom perk not found in data generator
      for (let i = 0; i < 100; i++) {
         const perk = intermediate.perks[i]
         if(!perk) continue
         acc[i] = perk
      }
      return acc
   }, {})

   return {
      intermediate: {
         perks: updatedIntermediate,
         databaseSettings: {
            ...intermediate.databaseSettings,
            folders: dataGenerator.databaseSettings.folders,
            enhancedPerks: dataGenerator.databaseSettings.enhancedPerks
         }
      },
      live: {
         perks: live.perks,
         databaseSettings: {
            ...live.databaseSettings,
            folders: dataGenerator.databaseSettings.folders,
            enhancedPerks: dataGenerator.databaseSettings.enhancedPerks
         }
      }
   }
}
