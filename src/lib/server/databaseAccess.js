import { env } from '$env/dynamic/private';
import { dev } from '$app/environment';
import { TypedObject } from '$lib/types';
import { drizzle } from 'drizzle-orm/postgres-js';
import { squeal } from '@drizzle/db';
export async function updateDescription(language, descriptionData) {
    const sql = squeal();
    const { description, user, live, ready, timestamp, hash } = descriptionData;
    // update if values was changes less than 1 hour ago
    const updateResult = await sql `
    UPDATE
      ${sql(language)}
    SET
      ${sql(descriptionData, TypedObject.keys(descriptionData))}
    WHERE
      "hash" = ${hash}
    AND
      "timestamp" > ${timestamp - 3600}
    RETURNING 
      "id";
  `;
    // skip if update was successful
    if (updateResult.length !== 0)
        return;
    // insert if values was changed more than 1 hour ago or it's a new description
    await sql `
    INSERT INTO ${sql(language)}
      ("description",           "user",  "live",  "ready",  "timestamp",  "hash")
    SELECT 
      ${description}, ${user}, ${live}, ${ready}  ${timestamp}, ${hash}
    WHERE NOT EXISTS ( -- this mess is for comparing the description with the latest one
      SELECT 1
      FROM ${sql(language)} e2 -- e2 is a reference to the table in the outer query
      WHERE e2."hash" = ${hash}
      AND e2."timestamp" = (
        SELECT MAX(e3."timestamp") -- e3 is a reference to the table in the subquery
        FROM ${sql(language)} e3
        WHERE e3."hash" = ${hash}
      )
      AND e2."description" = ${description} -- as never to prevent type error
    );
  `;
    await sql.end();
}
export async function updateComments(data) {
    const sql = squeal();
    await sql.begin((sql) => Object.entries(data).map(([hash, data]) => sql `
        UPDATE descriptions
        SET ${sql(data)}
        WHERE hash = ${hash};
  `));
    await sql.end();
}
export async function loadPageData(hash, language, firstLoad) {
    const timeStart = Date.now();
    const db = drizzle(squeal(env, dev));
    await db.select().from('perks');
    const timeEnd = Date.now();
    console.log(`Database response time ${(timeEnd - timeStart) / 1000}s`);
    return {};
}
//# sourceMappingURL=databaseAccess.js.map