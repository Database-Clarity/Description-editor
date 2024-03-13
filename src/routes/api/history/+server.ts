// import { json } from '@sveltejs/kit'
// import type { RequestHandler } from './$types'
// import { checkLanguages, checkTimestamps, squeal } from '../helpers'

// export const GET: RequestHandler = async ({ request }) => {
//   const sql = squeal()
//   const URLparams = new URLSearchParams(request.url.substring(request.url.indexOf('?')))
//   const { start, end } = checkTimestamps(URLparams)
//   const lang = checkLanguages(URLparams)[1]
//   const getTimeStamps = URLparams.has('getTimestamps')
//   if (getTimeStamps) {
//     const timeStamps = sql`
//       SELECT "timestamp"
//       FROM ${lang}
//       WHERE "hash" = ${URLparams.get('hash')}
//     `
//     return json(timeStamps)
//   } else {
//     const history = sql`
//       SELECT "description", "user", "live", "ready", "timestamp", "hash"
//       FROM ${lang}
//       WHERE "hash" = ${URLparams.get('hash')}
//       AND "timestamp" >= ${start}
//       AND "timestamp" <= ${end}
//     `
//     return json(history)
//   }
// }
