import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

// get data from the database
export const GET: RequestHandler = async ({ request }) => {
  const { a, b } = await request.json()
  return json(a + b)
}

// add new data to the database
export const POST: RequestHandler = async ({ request }) => {
  const { a, b } = await request.json()
  return json(a + b)
}

// remove data from the database
export const DELETE: RequestHandler = async ({ request }) => {
  const { a, b } = await request.json()
  return json(a + b)
}
