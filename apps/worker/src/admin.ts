import { z } from 'zod';
import { permissionsSchema, tooltipSchema } from '@clarity/core';
import { RefRace, type GitHub } from './github.js';
import { body, hashParam, HttpError, json } from './http.js';
import { permissions, requireAccess } from './permissions.js';
import type { Identity } from './types.js';

export async function managePermissions(
  request: Request,
  github: GitHub,
  user: Identity,
): Promise<Response> {
  const input = request.method === 'PUT' ? await body(request, permissionsSchema) : null;
  for (let attempt = 0; attempt < 3; attempt++) {
    const head = await github.head();
    const current = await permissions(github, head);
    requireAccess(current, user, ['maintainer']);
    if (!input) return json(current);
    if (!Object.values(input.users).some((access) => access.role === 'maintainer')) {
      throw new HttpError(400, 'At least one maintainer must remain');
    }
    try {
      const commit = await github.commit(
        head,
        {
          'config/permissions.json': input,
        },
        `Update editor permissions by ${user.login}`,
        user,
      );
      return json({ commit, permissions: input });
    } catch (error) {
      if (!(error instanceof RefRace)) throw error;
    }
  }
  throw new HttpError(409, 'Data branch kept moving; reload permissions and retry');
}

const historySchema = z.array(
  z.object({
    sha: z.string(),
    commit: z.object({
      author: z.object({ name: z.string(), date: z.string() }).nullable(),
      message: z.string(),
    }),
    author: z.object({ login: z.string() }).nullable(),
  }),
);

export async function history(
  request: Request,
  github: GitHub,
  user: Identity,
  rawHash: string,
): Promise<Response> {
  const hash = hashParam(rawHash);
  const url = new URL(request.url);
  const commit = url.searchParams.get('commit');
  requireAccess(await permissions(github, await github.head()), user, [
    'maintainer',
    'editor',
    'trial',
    'translator',
  ]);
  if (commit) {
    if (!/^[0-9a-f]{40}$/.test(commit)) throw new HttpError(400, 'Invalid commit SHA');
    const file = await github.file(`tooltips/${hash}.json`, commit);
    if (!file) throw new HttpError(404, 'Tooltip did not exist at that commit');
    const tooltip = tooltipSchema.parse(file.value);
    if (tooltip.hash !== hash) throw new HttpError(502, 'Stored tooltip hash mismatch');
    return json({ commit, tooltip });
  }
  const page = Number(url.searchParams.get('page') ?? '1');
  if (!Number.isInteger(page) || page < 1 || page > 10000) throw new HttpError(400, 'Invalid page');
  const query = new URLSearchParams({
    sha: github.env.DATA_BRANCH,
    path: `tooltips/${hash}.json`,
    per_page: '30',
    page: String(page),
  });
  const commits = historySchema.parse(await github.result(`/commits?${query}`));
  return json({
    page,
    commits: commits.map((entry) => ({
      commit: entry.sha,
      author: entry.author?.login ?? entry.commit.author?.name ?? null,
      date: entry.commit.author?.date ?? null,
      message: entry.commit.message,
    })),
  });
}
