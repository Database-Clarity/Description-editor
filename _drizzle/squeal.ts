import postgres from 'postgres'

export function squeal(env: Record<string, string | undefined>, dev: boolean) {
  const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD, ENDPOINT_ID } = env

  return postgres({
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
