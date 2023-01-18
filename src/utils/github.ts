import { decode, encode } from 'js-base64'

import { Database } from '@icemourne/description-converter'
import { apiUrlsV2 } from 'src/data/urls'
import { defaultPerk } from 'src/data/randomData'
import { getLoginDetails } from './getLogin'
import { persistentFetch } from '@icemourne/tool-box'

export interface DataToSend {
   sha: string
   content: string
}
export interface GithubJsonResponse {
   content: string
   sha: string
}

export interface GithubGetResponse {
   content: Database
   sha: string
}

export async function githubGet(location: keyof typeof apiUrlsV2): Promise<GithubGetResponse | string> {
   const url = apiUrlsV2[location].url + `?ref=${apiUrlsV2[location].branch}`
   const login = getLoginDetails()
   if (login === null) {
      return 'Login details missing'
   }

   const resp = await persistentFetch(url, 5, {
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
      const rawResp = await persistentFetch(url + '&cache=buster', 5, {
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

   const resp = await persistentFetch(api.url, 5, {
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

const unauthorized = async (location: keyof typeof apiUrlsV2): Promise<Database> => {
   const { raw } = apiUrlsV2[location]
   const resp = await persistentFetch(raw, 3)
   if (resp === Error) {
      return resp.message
   }
   return resp
}

export async function getStartUpDescriptions() {
   const intermediateResp = unauthorized('intermediate'),
      dataGeneratorResp = unauthorized('dataGenerator'),
      liveResp = unauthorized('live')

   const intermediate = await intermediateResp,
      dataGenerator = await dataGeneratorResp,
      live = await liveResp

   const updatedIntermediate = Object.entries(dataGenerator).reduce((acc, [key, value]) => {
      acc[key] = {
         ...(intermediate[key] || defaultPerk),
         ...value
      }
      return acc
   }, intermediate)

   return {
      intermediate: updatedIntermediate,
      live
   }
}
