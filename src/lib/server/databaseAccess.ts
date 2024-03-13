import postgres from 'postgres'
import { env } from '$env/dynamic/private'
import { dev } from '$app/environment'
import { type PerkTypes, type LanguageCode, TypedObject, languageCodes } from '$lib/types'
import type { Description as DescriptionData } from '$lib/editor/editorStore'
import { drizzle } from 'drizzle-orm/postgres-js'
import { squeal } from '@drizzle/db'

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

// export async function loadPageData(hash: number, language: LanguageCode, firstLoad: boolean) {
//   const timeStart = Date.now()
//   const sql = squeal()

//   const perksPromise = firstLoad
//     ? sql<Perks[]>`
//     SELECT * FROM "perks";
//   `
//     : []

//   const enDescriptionPromise = sql<DescriptionData[]>`
//     SELECT "hash", "description", "user", "live", "ready", "timestamp"
//     FROM "en"
//     WHERE "hash" = ${hash};
//   `
//   const mlDescriptionPromise =
//     language !== 'en'
//       ? sql<DescriptionData[]>`
//     SELECT "hash", "description", "user", "live", "ready", "timestamp"
//     FROM ${sql(language)}
//     WHERE "hash" = ${hash};
//   `
//       : []

//   const commentsPromise = sql<Comment[]>`
//     SELECT "hash", "user", "text", "timestamp"
//     FROM "comment"
//     WHERE "hash" = ${hash};
//   `

//   const [perks, enDescription, comments, mlDescription] = await Promise.all([
//     perksPromise,
//     enDescriptionPromise,
//     commentsPromise,
//     mlDescriptionPromise,
//   ])

//   const columns = ['description', 'user', 'live', 'ready', 'timestamp', 'hash']
//   const lang = ['en', 'de']

//   const unionBuilder = (
//     sql: postgres.Sql,
//     langs: string[] | true,
//     cols: string[],
//     hashes: number[] | true,
//     timestamp: number | undefined
//   ) => {
//     const languages = langs === true ? languageCodes : langs

//     // TODO: then getting de for example we need specific en version not latest

//     return languages.map((lang, i, arr) => {
//       return sql`
//       (
//         SELECT

//         -- returns only latest entry for each hash
//         -- if timestamp is defined, return all entries after the timestamp
//         ${timestamp === undefined ? sql`DISTINCT ON ("hash")` : sql``}

//         -- adds column with the language
//         ${sql`${lang}`} AS "table",

//         -- adds the columns to be returned
//         ${sql(cols)}

//         -- table to be queried
//         FROM ${sql(lang)}

//         -- if hashes is true, return all hashes
//         -- otherwise return only the hashes in the array
//         ${hashes === true ? sql`` : sql`WHERE "hash" IN ${sql(hashes)}`}

//         -- if timestamp is defined, return all entries after the timestamp
//         ${timestamp === undefined ? sql`` : sql`AND "timestamp" > ${timestamp}`}

//         -- order by hash and timestamp to get the latest entry for each hash
//         -- required for DISTINCT ON
//         ORDER BY "hash", "timestamp" DESC
//       )
//       -- used to combine the results from each language
//       -- if it's the last element, don't add UNION ALL
//       ${i === arr.length - 1 ? sql`` : sql`UNION ALL`}
//     `
//     })
//   }

//   const test = sql`${unionBuilder(sql, true, columns, true, undefined)}`

//   console.log(await test)

//   sql.end()
//   const timeEnd = Date.now()
//   console.log(`Database response time ${(timeEnd - timeStart) / 1000}s`)

//   return {
//     perks: Object.fromEntries(perks.map((perk) => [perk.hash, perk])),
//     // return description if it exists
//     descriptions: { hash: { en: enDescription, [language]: mlDescription } },
//     // return comments if they exist, otherwise return placeholder
//     comments: Object.fromEntries(comments.map((comment) => [comment.hash, comment])),
//   }
// }

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

export async function updateDescription(language: LanguageCode, descriptionData: DescriptionData) {
  const sql = squeal()

  const { description, user, live, ready, timestamp, hash } = descriptionData

  // update if values was changes less than 1 hour ago
  const updateResult = await sql`
    UPDATE
      ${sql(language)}
    SET
      ${sql(descriptionData, TypedObject.keys(descriptionData))}
    WHERE
      "hash" = ${hash}
    AND
      "timestamp" > ${timestamp - 3600}
    RETURNING 
      "id";
  `

  // skip if update was successful
  if (updateResult.length !== 0) return

  // insert if values was changed more than 1 hour ago or it's a new description
  await sql`
    INSERT INTO ${sql(language)}
      ("description",           "user",  "live",  "ready",  "timestamp",  "hash")
    SELECT 
      ${description as never}, ${user}, ${live}, ${ready}  ${timestamp}, ${hash}
    WHERE NOT EXISTS ( -- this mess is for comparing the description with the latest one
      SELECT 1
      FROM ${sql(language)} e2 -- e2 is a reference to the table in the outer query
      WHERE e2."hash" = ${hash}
      AND e2."timestamp" = (
        SELECT MAX(e3."timestamp") -- e3 is a reference to the table in the subquery
        FROM ${sql(language)} e3
        WHERE e3."hash" = ${hash}
      )
      AND e2."description" = ${description as never} -- as never to prevent type error
    );
  `

  await sql.end()
}

export async function updateComments(data: Descriptions) {
  const sql = squeal()

  await sql.begin((sql) =>
    Object.entries(data).map(
      ([hash, data]) => sql`
        UPDATE descriptions
        SET ${sql(data)}
        WHERE hash = ${hash};
  `
    )
  )

  await sql.end()
}

export async function loadPageData(hash: number, language: LanguageCode, firstLoad: boolean) {
  const timeStart = Date.now()

  const db = drizzle(squeal(env, dev))

  await db.select().from('perks')

  const timeEnd = Date.now()
  console.log(`Database response time ${(timeEnd - timeStart) / 1000}s`)
  return {}
}
