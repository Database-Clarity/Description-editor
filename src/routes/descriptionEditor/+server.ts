import { error, json } from '@sveltejs/kit'

import { env } from '$env/dynamic/private'
import { squeal } from '$lib/server/squeal.js'

export async function POST({ request, cookies }) {
  const { lang, description, live, ready, hash, username } = await request.json()

  // Limit description size to 10KB
  if (new TextEncoder().encode(description).length > 1024 * 10) {
    error(400, 'Description is too long')
  }

  const sql = squeal(env, true)
  // const username = cookies.get('username')!
  const timestamp = Date.now()

  // update if values was changes less than 1 hour ago
  const updateResult = await sql`
    UPDATE ${sql(lang)}
    SET
      "description" = ${description},
      "username" = ${username},
      "live" = ${live},
      "ready" = ${ready},
      "timestamp" = CURRENT_TIMESTAMP
    WHERE
      "hash" = ${hash}
    AND
      "timestamp" > (CURRENT_TIMESTAMP - INTERVAL '1 hour')
    RETURNING
      "id";
  `

  // skip if update was successful
  if (updateResult.length !== 0) return json({ status: 201 })

  // insert values if last changed was made more than 1 hour ago or it's a new description
  await sql`
    INSERT INTO ${sql(lang)}
      ("description",  "username",  "live",  "ready",  "timestamp",  "hash")
    SELECT
      ${description}, ${username}, ${live}, ${ready}, ${timestamp}, ${hash}
    WHERE NOT EXISTS ( -- this mess is for comparing the description with the latest one
      SELECT 1
      FROM ${sql(lang)} e2 -- e2 is a reference to the table in the outer query
      WHERE e2."hash" = ${hash}
      AND e2."timestamp" = (
        SELECT MAX(e3."timestamp") -- e3 is a reference to the table in the subquery
        FROM ${sql(lang)} e3
        WHERE e3."hash" = ${hash}
      )
      AND e2."description" = ${description} -- as never to prevent type error
    );`

  return json({ status: 201 })
}
