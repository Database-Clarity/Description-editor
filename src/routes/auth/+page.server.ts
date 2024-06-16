import type { PageServerLoad } from './$types'
import { env } from '$env/dynamic/private'
import { dev } from '$app/environment'
import { encrypt } from '$lib/server/encryption'
import { sql } from '$lib/server/squeal'

type AuthResponse = {
  access_token: string
  expires_in: number
  refresh_token: string
  refresh_expires_in: number
  membership_id: string
}

type User = {
  membershipId: string
  uniqueName: string
  displayName: string
  locale: string
  steamDisplayName: string
}

export const load = (async ({ url, cookies }) => {
  const code = new URLSearchParams(url.search).get('code')
  if (!code) return { success: false }

  try {
    const authResponse: AuthResponse = await fetch('https://www.bungie.net/Platform/App/OAuth/Token/', {
      method: 'POST',
      headers: {
        'X-API-Key': env.BUNGIE_API_KEY!,
        'authorization': `Basic ${Buffer.from(`${dev ? 40419 : 0}:${env.BUNGIE_CLIENT_SECRET}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `grant_type=authorization_code&code=${code}`,
    }).then((res) => res.json())

    const user: User = await fetch('https://www.bungie.net/Platform/User/GetMembershipsForCurrentUser/', {
      headers: {
        'X-API-Key': env.BUNGIE_API_KEY!,
        'authorization': `Bearer ${authResponse.access_token}`,
      },
    })
      .then((res) => res.json())
      .then((res) => res.Response.bungieNetUser)

    cookies.set('accessToken', authResponse.access_token, { path: '/', maxAge: authResponse.expires_in })
    cookies.set('refreshToken', authResponse.refresh_token, { path: '/', maxAge: authResponse.refresh_expires_in })
    cookies.set('membershipId', encrypt(authResponse.membership_id), {
      path: '/',
      maxAge: authResponse.refresh_expires_in,
    })
    cookies.set('username', user.displayName, { path: '/', maxAge: authResponse.refresh_expires_in, httpOnly: false })

    const role = await sql`INSERT INTO "user" (username, role, membership_id)
      VALUES (${user.displayName}, 'user', ${user.membershipId})
      ON CONFLICT (username)
      DO UPDATE SET membership_id = ${user.membershipId}
      RETURNING role;
    `
    cookies.set('role', role[0].role ?? 'user', { path: '/', maxAge: authResponse.refresh_expires_in, httpOnly: false })
  } catch {
    return { success: false }
  }

  return { success: true }
}) satisfies PageServerLoad
