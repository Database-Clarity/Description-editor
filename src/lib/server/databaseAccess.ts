import postgres from 'postgres'
import { env } from '$env/dynamic/private'
import { dev } from '$app/environment'
import type { PerkTypes } from '$lib/types'

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
  name: string
  type: PerkTypes
  icon: string
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

export async function loadPageData(hash: number, language: string) {
  const sql = squeal()

  const perksPromise = sql<Perks[] | []>`
    SELECT p1."hash",
      p1."itemHash",
      p1."name"->>${language} as "name",
      p1."type",
      p1."icon",
      p1."appearsOn",
      p1."linkedWith"
    FROM "perks" p1
    JOIN (
      SELECT "type"
      FROM "perks"
      WHERE "hash" = ${hash}
    ) p2
    ON p1."type" = p2."type";
  `

  const descriptionPromise = sql<Description[] | []>`
    SELECT "hash", "description", "user", "live", "ready", "timestamp"
    FROM ${sql(language)}
    WHERE "hash" = ${hash};
  `

  const commentsPromise = sql<Comment[] | []>`
    SELECT "hash", "user", "text", "timestamp"
    FROM "comment"
    WHERE "hash" = ${hash};
  `

  const [perks, description, comments] = await Promise.all([perksPromise, descriptionPromise, commentsPromise])

  sql.end()
  return {
    perks: Object.fromEntries(perks.map((perk) => [perk.hash, perk])),
    // return description if it exists, otherwise return placeholder
    descriptions:
      description.length !== 0
        ? Object.fromEntries(description.map((description) => [description.hash, description]))
        : {
            [hash]: {
              hash,
              description: {},
              user: '',
              live: false,
              ready: false,
              timestamp: 0,
            } satisfies Description,
          },
    // return comments if they exist, otherwise return placeholder
    comments:
      comments.length !== 0
        ? Object.fromEntries(comments.map((comment) => [comment.hash, comment]))
        : {
            [hash]: {
              hash,
              user: '',
              text: '',
              timestamp: 0,
            } satisfies Comment,
          },
    hash,
  }
}

export async function getPerks() {
  const sql = squeal()

  const data = await sql`
    SELECT ${sql(['hash', 'perk'])}
    FROM perks;
  `

  sql.end()

  return data.reduce((acc, cur) => {
    const { hash, ...rest } = cur
    acc[hash] = rest
    return acc
  }, {})
}

export async function getDescriptions(languages: string[], hashes: number[]) {
  const sql = squeal()

  const data = await sql`
    SELECT ${sql([...languages, 'hash'])}
    FROM descriptions
    WHERE hash in ${sql(hashes)};
  `

  sql.end()

  return data.reduce((acc, cur) => {
    const { hash, ...rest } = cur
    acc[hash] = rest
    return acc
  }, {})
}

type Hash = number
type Language = string

export type Descriptions = {
  [key: Hash]: {
    [key: Language]: {
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

export async function getComments(hashes: number) {
  const sql = squeal()

  const data = await sql`
    SELECT ${sql(['comments', 'hash'])}
    FROM descriptions
    WHERE hash in ${hashes};
    `

  sql.end()

  return data.reduce((acc, cur) => {
    const { hash, ...rest } = cur
    acc[hash] = rest
    return acc
  }, {})
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
