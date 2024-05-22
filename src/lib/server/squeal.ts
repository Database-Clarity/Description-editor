import { dev } from '$app/environment'
import { env } from '$env/dynamic/private'
import postgres from 'postgres'

// let connection: ReturnType<typeof postgres> | null = null

// export function squeal(env: Record<string, string | undefined>, dev: boolean) {
//   const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD, ENDPOINT_ID } = env

//   if (connection) return connection

//   const pg = postgres({
//     host: PGHOST,
//     database: PGDATABASE,
//     username: PGUSER,
//     password: PGPASSWORD,
//     port: 5432,
//     ssl: 'require',
//     connection: {
//       options: `project=${ENDPOINT_ID}`,
//     },
//     debug: dev,
//     types: {
//       // converts bigint to number
//       bigint: {
//         to: 0,
//         from: [20],
//         serialize: (hash: number) => String(hash),
//         parse: (hash: number) => Number(hash),
//       },
//     },
//   })

//   connection = pg
//   return pg
// }

export class Squeal {
  public squeal: ReturnType<typeof postgres>

  constructor() {
    const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD, ENDPOINT_ID } = env
    this.squeal = postgres({
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
      types: {
        // converts bigint to number
        bigint: {
          to: 0,
          from: [20],
          serialize: (hash: number) => String(hash),
          parse: (hash: number) => Number(hash),
        },
      },
    })
  }
}

export const sql = new Squeal().squeal
