import { error, json } from '@sveltejs/kit'

import type { LanguageCode } from '$lib/types.js'
import { sql } from '$lib/server/squeal'
import { trimEmptyDivElements } from '$lib/utils.js'
import { decrypt } from '$lib/server/encryption'

type RequestJson = {
  lang: LanguageCode
  description: string
  live: boolean
  ready: boolean
  hash: number
}

export async function POST({ request, cookies }) {
  const { lang, description, live, ready, hash }: RequestJson = await request.json()

  const username = cookies.get('username')
  if (!username) {
    error(401, 'Invalid username')
  }
  const role = cookies.get('role')
  if (!role || (role !== 'admin' && role !== 'editor')) {
    error(401, 'Invalid role')
  }
  const decrypted_id = decrypt(cookies.get('membershipId')!)
  if (!decrypted_id) {
    error(401, 'Invalid membership_id')
  }

  const hasPermission = await sql`
    SELECT role
    FROM "user"
    WHERE "membership_id" = ${decrypted_id}
    AND "role" IN ('admin', 'editor')
  `

  if (hasPermission.length === 0 || hasPermission[0].role !== role) {
    error(401, 'Role provided in the cookie does not match the one in the database')
  }

  const trimmedDescription = trimEmptyDivElements(description)

  // Limit description size to 10KB
  if (new TextEncoder().encode(trimmedDescription).length > 1024 * 10) {
    error(400, 'Description is too long')
  }

  // const username = cookies.get('username')!
  const timestamp = Date.now()

  // update if values was changes less than 1 hour ago
  const updateResult = await sql`
    UPDATE ${sql(lang)}
    SET
      "description" = ${trimmedDescription},
      "username" = ${cookies.get('username')!},
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
      ${trimmedDescription}, ${cookies.get('username')!}, ${live}, ${ready}, ${timestamp}, ${hash}
    WHERE NOT EXISTS ( -- this mess is for comparing the description with the latest one
      SELECT 1
      FROM ${sql(lang)} e2 -- e2 is a reference to the table in the outer query
      WHERE e2."hash" = ${hash}
      AND e2."timestamp" = (
        SELECT MAX(e3."timestamp") -- e3 is a reference to the table in the subquery
        FROM ${sql(lang)} e3
        WHERE e3."hash" = ${hash}
      )
      AND e2."description" = ${trimmedDescription}
    );`

  return json({ status: 201 })
}
