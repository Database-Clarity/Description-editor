import { decrypt } from '$lib/server/encryption'
import { sql } from '$lib/server/squeal'
import type { LayoutServerLoad } from './$types'

export const load = (async ({ cookies }) => {
  const username = cookies.get('username')
  const currentRole = cookies.get('role')
  const decrypted_id = decrypt(cookies.get('membershipId')!)

  if (username && currentRole && decrypted_id) {
    const newRole = await sql`
      SELECT role
      FROM "user"
      WHERE "membership_id" = ${decrypted_id} AND "username" = ${username};
    `

    if (newRole.length !== 0 && newRole[0].role !== currentRole) {
      cookies.set('role', newRole[0].role, { path: '/', maxAge: 60 * 60 * 24 * 180, httpOnly: false })
    }
  }

  return { username: cookies.get('username') }
}) satisfies LayoutServerLoad
