import type { LanguageCode, PerkTypes } from '../types'

import Redis from 'ioredis'
import { env } from '$env/dynamic/private'
import { squeal } from './squeal'

type Perks = {
  hash: number
  itemHash: number | null
  name: { [key in LanguageCode]: string }
  itemName: { [key in LanguageCode]: string }
  type: PerkTypes
  icon: string
  itemIcon: string
  appearsOn: string[] | number[]
  linkedWith: number[] | null
}

type Comment = {
  hash: number
  user: string
  text: string
  timestamp: number
}

type Hash = number

export type Descriptions = {
  [key: Hash]: {
    [key in LanguageCode]: {
      description: { [key: string]: { [key: string]: { [key: string]: string } } }
      timeStamp: number
      user: string
    }
  }
}

// export async function updateDescription(language: LanguageCode, descriptionData: Descriptions) {
//   const sql = squeal()

//   const { description, user, live, ready, timestamp, hash } = descriptionData

//   // update if values was changes less than 1 hour ago
//   const updateResult = await sql`
//     UPDATE
//       ${sql(language)}
//     SET
//       ${sql(descriptionData, TypedObject.keys(descriptionData))}
//     WHERE
//       "hash" = ${hash}
//     AND
//       "timestamp" > ${timestamp - 3600}
//     RETURNING
//       "id";
//   `

//   // skip if update was successful
//   if (updateResult.length !== 0) return

//   // insert if values was changed more than 1 hour ago or it's a new description
//   await sql`
//     INSERT INTO ${sql(language)}
//       ("description",           "user",  "live",  "ready",  "timestamp",  "hash")
//     SELECT
//       ${description as never}, ${user}, ${live}, ${ready}  ${timestamp}, ${hash}
//     WHERE NOT EXISTS ( -- this mess is for comparing the description with the latest one
//       SELECT 1
//       FROM ${sql(language)} e2 -- e2 is a reference to the table in the outer query
//       WHERE e2."hash" = ${hash}
//       AND e2."timestamp" = (
//         SELECT MAX(e3."timestamp") -- e3 is a reference to the table in the subquery
//         FROM ${sql(language)} e3
//         WHERE e3."hash" = ${hash}
//       )
//       AND e2."description" = ${description as never} -- as never to prevent type error
//     );
//   `

//   await sql.end()
// }

// export async function updateComments(data: Descriptions) {
//   const sql = squeal()

//   await sql.begin((sql) =>
//     Object.entries(data).map(
//       ([hash, data]) => sql`
//         UPDATE descriptions
//         SET ${sql(data)}
//         WHERE hash = ${hash};
//   `
//     )
//   )

//   await sql.end()
// }

export async function loadPageData(hash: number, language: LanguageCode, timestamp: number) {
  // const redis = new Redis('rediss://default:afeddd4767654f16a8cc7a9276f9876a@ace-mosquito-49121.upstash.io:49121')
  // const redisKey = 'pageData-' + hash + '-' + language

  // let total_redis = 0

  // for (let i = 0; i < 60; i++) {
  //   const start_redis = Date.now()
  //   await redis.get(redisKey)

  //   const end_redis = Date.now()
  //   total_redis += end_redis - start_redis

  //   console.log('Redis time:', end_redis - start_redis)

  //   await new Promise((resolve) => setTimeout(resolve, 1000))
  // }

  // console.log('Average Redis time:', total_redis / 60)

  // const pageData = await redis.get(redisKey)
  // const end_redis = Date.now()
  // // console.log('Redis time:', end_redis - start_redis)
  // if (pageData) {
  //   return JSON.parse(pageData)
  // }

  // let total_redis = 0
  const sql = squeal(env, true)

  // for (let i = 0; i < 60; i++) {
  //   const start_redis = Date.now()
  //   await sql`SELECT "hash", ${sql('name_' + language)}, type FROM perk WHERE "hash" = ${hash}`

  //   const end_redis = Date.now()
  //   total_redis += end_redis - start_redis

  //   console.log('sql time:', end_redis - start_redis)

  //   await sql.end()

  //   await new Promise((resolve) => setTimeout(resolve, 1000))
  // }

  // console.log('Average sql time:', total_redis / 60)

  // const start_sql = Date.now()

  const perks = sql`SELECT "hash", "name_en", type FROM perk WHERE "hash" = ${hash}`

  // const [perks] = await Promise.all([
  //   sql`SELECT "hash", ${sql('name_' + language)}, type FROM perk`,
  //   sql`
  //     SELECT * FROM ${sql(language)}
  //     WHERE hash = ${hash}
  //     AND timestamp = (
  //       SELECT MAX(timestamp)
  //       FROM ${sql(language)}
  //       WHERE hash = ${hash}
  //       AND timestamp <= ${timestamp}
  //     )
  //   `,
  // ])

  // // const end_sql = Date.now()
  // // console.log('SQL time:', end_sql - start_sql)

  // // await sql.end()

  // // if (perks.length !== 0) {
  // //   redis.set(redisKey, JSON.stringify({ perks }), 'EX', 600)
  // // }

  return { perks }
}
