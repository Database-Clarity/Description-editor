import { sql } from './squeal'
import type { LanguageCode, PerkTypes } from '$lib/types'
import { decrypt } from './encryption'
import type { Cookies } from '@sveltejs/kit'
import { trimEmptyDivElements } from '$lib/utils'

type Description = {
  description: string
  username: string
  live: boolean
  ready: boolean
  timestamp: number
}

export function description(lang: LanguageCode, hash: number) {
  return sql<Description[]>`
    SELECT
      "description",
      "username",
      "live",
      "ready",
      "timestamp"
    FROM
      ${sql(lang)}
    WHERE
      "hash" = ${hash}
      AND timestamp = (
        SELECT
          MAX(timestamp)
        FROM
          ${sql(lang)}
        WHERE
          hash = ${hash}
      );
  `
}

type Comments = {
  username: string
  timestamp: number
  text: string
}

export function comment(hash: number) {
  return sql<Comments[]>`
    SELECT
      "username",
      "timestamp",
      "text"
    FROM
      "comment"
    WHERE
      "hash" = ${hash};
  `
}

export type Perk = {
  hash: number
  name: string
  type: PerkTypes
}

export function perks(lang: LanguageCode) {
  const name = 'name_' + lang
  return sql<Perk[]>`
    SELECT
      "hash",
      ${sql(name)} as "name",
      type
    FROM
      "perk"
    ORDER BY
      ${sql(name)} ASC;
  `
}

export type User = {
  role: 'admin' | 'editor' | 'user'
}

export async function hasEditPermissions(cookies: Cookies) {
  const username = cookies.get('username')
  const role = cookies.get('role')
  const encryptedMembershipId = cookies.get('membershipId')
  if (!username || !role || !encryptedMembershipId) return false
  if (role !== 'admin' && role !== 'editor') return false

  const decrypted_id = decrypt(encryptedMembershipId)
  if (!decrypted_id) return false

  const user = await sql<User[]>`
    SELECT
      "role"
    FROM
      "user"
    WHERE
      "membership_id" = ${decrypted_id}
      AND "username" = ${username}
      AND "role" IN ('admin', 'editor');
  `

  if (user.length === 0) return false

  return true
}

export async function insertDescription(
  description: string,
  lang: LanguageCode,
  hash: number,
  live: boolean,
  ready: boolean,
  cookies: Cookies
) {
  const trimmedDescription = trimEmptyDivElements(description)
  const username = cookies.get('username')
  if (!username) return false

  // Limit description size to 10KB
  if (new TextEncoder().encode(trimmedDescription).length > 1024 * 10) {
    return false
  }

  // Update if values was changes less than 1 hour ago
  // If nothing was updated it will return an empty array
  const updateResult = await sql`
    UPDATE ${sql(lang)}
    SET
      "description" = ${trimmedDescription},
      "username" = ${username},
      "live" = ${live},
      "ready" = ${ready},
      "timestamp" = CURRENT_TIMESTAMP
    WHERE
      "hash" = ${hash}
      AND "timestamp" > (CURRENT_TIMESTAMP - INTERVAL '1 hour') RETURNING "id";
  `

  // If the array is not empty, it means that the update was successful
  if (updateResult.length !== 0) return true

  // Insert values if last changed was made more than 1 hour ago or it's a new description
  // If old descriptions is same as the new one, it will not insert it
  // Don't ask how it works - Magic
  await sql`
    INSERT INTO
      ${sql(lang)} (
        "description",
        "username",
        "live",
        "ready",
        "timestamp",
        "hash"
      )
    SELECT
      ${trimmedDescription},
      ${username},
      ${live},
      ${ready},
      CURRENT_TIMESTAMP, 
      ${hash}
    WHERE
      NOT EXISTS ( -- this mess is for comparing the description with the latest one
        SELECT
          1
        FROM
          ${sql(lang)} e2 -- e2 is a reference to the table in the outer query
        WHERE
          e2."hash" = ${hash}
          AND e2."timestamp" = (
            SELECT
              MAX(e3."timestamp") -- e3 is a reference to the table in the subquery
            FROM
              ${sql(lang)} e3
            WHERE
              e3."hash" = ${hash}
          )
          AND e2."description" = ${trimmedDescription}
      );
  `

  return true
}
