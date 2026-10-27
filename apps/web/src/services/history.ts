import { pushedSchema, tooltipSchema } from '@clarity/core';
import { z } from 'zod';
import { apiRequest } from './api';

const commitSchema = z.object({
  commit: z.string().regex(/^[0-9a-f]{40}$/),
  author: z.string().nullable(),
  login: z.string().nullable().optional(),
  avatar: z.string().url().nullable().optional(),
  date: z.string().nullable(),
  message: z.string(),
});
export type HistoryCommit = z.infer<typeof commitSchema>;
const historySchema = z.object({ page: z.number(), commits: z.array(commitSchema) });
const versionSchema = z.object({ commit: z.string(), tooltip: tooltipSchema });
const liveSchema = z.object({
  pushedHash: z.string().nullable(),
  tooltip: tooltipSchema.nullable(),
});
const pushSchema = z.object({
  commit: z.string(),
  liveCommit: z.string(),
  pushed: pushedSchema,
  branch: z.string(),
});

async function request(
  path: string,
  signal?: AbortSignal,
  push?: { hashes: number[]; expected: Record<string, string> },
): Promise<unknown> {
  const response = await apiRequest(path, {
    method: push ? 'POST' : 'GET',
    signal,
    headers: {
      ...(push ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(push ? { body: JSON.stringify(push) } : {}),
  });
  if (!response.ok) throw new Error(`API HTTP ${response.status}: ${await response.text()}`);
  return response.json();
}

export async function getHistory(hash: number, page = 1, signal?: AbortSignal) {
  return historySchema.parse(await request(`/history/${hash}?page=${page}`, signal));
}

export async function getVersion(hash: number, commit: string, signal?: AbortSignal) {
  return versionSchema.parse(
    await request(`/history/${hash}?commit=${encodeURIComponent(commit)}`, signal),
  );
}

export async function getPushedVersion(hash: number, signal?: AbortSignal) {
  return liveSchema.parse(await request(`/history/${hash}?live=1`, signal));
}

export async function pushSelected(hashes: number[], expected: Record<string, string>) {
  return pushSchema.parse(await request('/push-live', undefined, { hashes, expected }));
}
