import type { LanguageCode, PerkTypes } from '../types'

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

export async function updateDescription(language: LanguageCode, descriptionData: Descriptions) {
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

export async function loadPageData(hash: number, language: LanguageCode) {
  const sql = squeal(env, true)

  const [perks] = await Promise.all([
    sql`
      SELECT * FROM perks
      WHERE hash = ${hash}
    `,
  ])

  await sql.end()

  return { perks }
}
