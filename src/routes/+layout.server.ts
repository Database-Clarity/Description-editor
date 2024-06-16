import type { LayoutServerLoad } from './$types'

export const load = (async ({ cookies }) => {
  return { username: cookies.get('username')! }
}) satisfies LayoutServerLoad
