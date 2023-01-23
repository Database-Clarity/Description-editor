import { Database, Stat, StatNames, Stats } from '@icemourne/description-converter'
import { TypedObject, persistentFetch } from '@icemourne/tool-box'
import { decode, encode } from 'js-base64'

import { apiUrlsV2 } from 'src/data/urls'
import { defaultPerk } from 'src/data/randomData'
import { getLoginDetails } from './getLogin'

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

// TODO: remove this when the data is fixed
const fixStatNames = (data: Database) => {
   const fixStatName = (stats: Stats | undefined) => {
      if (stats === undefined) return undefined
      return Object.entries(stats).reduce((acc, value) => {
         const name = value?.[0]
         const stat = value?.[1]
         if (!stat || !name) return acc
         switch (name) {
            case 'handling':
               acc['Handling'] = stat
               break
            case 'damage':
               acc['Damage'] = stat
               break
            case 'aimAssist':
               acc['Aim Assist'] = stat
               break
            case 'range':
               acc['Range'] = stat
               break
            case 'reload':
               acc['Reload'] = stat
               break
            case 'airborne':
               acc['Airborne'] = stat
               break
            case 'stability':
               acc['Stability'] = stat
               break
            case 'ready':
               acc['Ready'] = stat
               break
            case 'stow':
               acc['Stow'] = stat
               break
            case 'chargeDraw':
               acc['Charge Draw'] = stat
               break
            case 'rateOfFire':
               acc['RPM'] = stat
               break
            case 'zoom':
               acc['Zoom'] = stat
               break
            default:
               // @ts-ignore
               acc[name] = stat
               break
         }
         return acc
      }, {} as { [key in StatNames]: Stat[] })
   }

   return Object.entries(data).reduce((acc, [key, value]) => {
      acc[key] = {
         ...value,
         stats: fixStatName(value?.stats)
      }

      return acc
   }, {} as Database)
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
      intermediate: fixStatNames(updatedIntermediate),
      live
   }
}
