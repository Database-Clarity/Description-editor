import { permissionsSchema } from '@clarity/core';
import type { Permissions } from '@clarity/core';
import { z } from 'zod';
import { apiRequest } from './api';
import { fetchJson } from './http';

async function checked(response: Response): Promise<unknown> {
  if (!response.ok)
    throw new Error(`Permissions HTTP ${response.status}: ${await response.text()}`);
  return response.json();
}

export async function getPermissions(signal?: AbortSignal): Promise<Permissions> {
  return permissionsSchema.parse(await checked(await apiRequest('/permissions', { signal })));
}

export async function putPermissions(permissions: Permissions): Promise<Permissions> {
  const input = permissionsSchema.parse(permissions);
  if (!Object.values(input.users).some((entry) => entry.role === 'maintainer')) {
    throw new Error('At least one maintainer must remain.');
  }
  const response = await apiRequest('/permissions', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  return z
    .object({ commit: z.string(), permissions: permissionsSchema })
    .parse(await checked(response)).permissions;
}

export async function resolveGitHubLogin(login: string) {
  const value = login.trim();
  if (!/^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i.test(value)) {
    throw new Error('Enter a GitHub login, not a profile URL or email address.');
  }
  return fetchJson(
    `https://api.github.com/users/${encodeURIComponent(value)}`,
    z.object({
      id: z.number().int().positive(),
      login: z.string().min(1),
    }),
    { credentials: 'omit', headers: { Accept: 'application/vnd.github+json' } },
  );
}
