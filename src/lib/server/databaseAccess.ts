import postgres from 'postgres'
import { env } from '$env/dynamic/private'
import { dev } from '$app/environment'
import type { PerkTypes, LanguageCode } from '$lib/types'

function squeal() {
  const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD, ENDPOINT_ID } = env

  return postgres({
    host: PGHOST,
    database: PGDATABASE,
    username: PGUSER,
    password: PGPASSWORD,
    port: 5432,
    ssl: 'require',
    connection: {
      options: `project=${ENDPOINT_ID}`,
    },
    debug: dev,
  })
}

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

type Description = {
  hash: number
  description: { [key: string]: unknown }
  user: string
  live: boolean
  ready: boolean
  timestamp: number
}

type Comment = {
  hash: number
  user: string
  text: string
  timestamp: number
}

function buildDescription(hash: number, data: { [key in LanguageCode]?: Description[] }) {
  const descriptions: { [key: number]: { [key in LanguageCode]?: { [key: number]: Description } } } = {
    [hash]: {},
  }

  for (const lang in data) {
    const language = lang as LanguageCode

    descriptions[hash][language] = {}

    for (const description of data[language]!) {
      descriptions[hash][language]![description.timestamp] = {
        hash,
        description: description.description,
        user: description.user,
        live: description.live,
        ready: description.ready,
        timestamp: description.timestamp,
      }
    }
  }

  return descriptions
}

export async function loadPageData(hash: number, language: LanguageCode, firstLoad: boolean) {
  const sql = squeal()

  const perksPromise = firstLoad
    ? sql<Perks[]>`
    SELECT * FROM "perks";
  `
    : []

  const enDescriptionPromise = sql<Description[]>`
    SELECT "hash", "description", "user", "live", "ready", "timestamp"
    FROM "en"
    WHERE "hash" = ${hash};
  `
  const mlDescriptionPromise =
    language !== 'en'
      ? sql<Description[]>`
    SELECT "hash", "description", "user", "live", "ready", "timestamp"
    FROM ${sql(language)}
    WHERE "hash" = ${hash};
  `
      : []

  const commentsPromise = sql<Comment[]>`
    SELECT "hash", "user", "text", "timestamp"
    FROM "comment"
    WHERE "hash" = ${hash};
  `

  const [perks, enDescription, comments, mlDescription] = await Promise.all([
    perksPromise,
    enDescriptionPromise,
    commentsPromise,
    mlDescriptionPromise,
  ])
  sql.end()

  return {
    perks: Object.fromEntries(
      perks.map((perk) => [
        perk.hash,
        {
          ...perk,
          // workaround for Postgres returning strings instead of numbers because JS can't handle bigint and Postgres doesn't have an unsigned int type
          hash: Number(perk.hash),
          itemHash: Number(perk.itemHash) ?? null,
        },
      ])
    ),
    // return description if it exists
    descriptions: buildDescription(hash, { en: enDescription, [language]: mlDescription }),
    // return comments if they exist, otherwise return placeholder
    comments: Object.fromEntries(comments.map((comment) => [comment.hash, comment])),
  }
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

export async function updateDescriptions(data: Descriptions) {
  const sql = squeal()

  for (const hash in data) {
    const descriptionData = data[hash]

    for (const language in descriptionData) {
      const { description, timeStamp, user } = descriptionData[language]

      // update if values was changes less than 1 hour ago
      const updateResult = await sql`
        UPDATE ${sql(language)}
        SET "description" = ${JSON.stringify(description)},
            "user" = ${user},
            "time_added" = ${timeStamp}
        WHERE "perk_hash" = ${hash}
        AND "time_added" > ${timeStamp - 3600}
        RETURNING *;
      `

      // skip if update was successful
      if (updateResult.length !== 0) continue

      // insert if values was changed more than 1 hour ago
      await sql`
        INSERT INTO ${sql(language)}
          ("description", "user", "time_added", "perk_hash")
        SELECT 
          ${JSON.stringify(description)}, ${user}, ${timeStamp}, ${hash}
        WHERE NOT EXISTS (
          SELECT 1
          FROM ${sql(language)} e2 -- e2 is a reference to the table in the outer query
          WHERE e2."perk_hash" = ${hash}
          AND e2."time_added" = (
            SELECT MAX(e3."time_added") -- e3 is a reference to the table in the subquery
            FROM ${sql(language)} e3
            WHERE e3."perk_hash" = ${hash}
          )
          AND e2."description" = ${JSON.stringify(description)}
        )
        RETURNING *;
      `
    }
  }

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
