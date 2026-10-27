import { hashSchema, langSchema, tooltipSchema, type Tooltip } from '@clarity/core';
import { z } from 'zod';

export const apiUrl = import.meta.env.VITE_API_URL?.trim().replace(/\/+$/, '') || undefined;
const userSchema = z.object({
  id: z.union([z.number(), z.string()]),
  login: z.string(),
  role: z.enum(['maintainer', 'editor', 'trial', 'translator']).nullable(),
  languages: z.array(langSchema).optional(),
});
export type User = z.infer<typeof userSchema>;
export type Me = User;
export interface Change {
  hash: number;
  base: Tooltip | null;
  next: Tooltip;
}
const conflictSchema = z.object({
  hash: hashSchema,
  base: tooltipSchema.nullable(),
  head: tooltipSchema.nullable(),
  next: tooltipSchema,
  fields: z.array(z.string()),
});
export type SaveConflict = z.infer<typeof conflictSchema>;
export type SaveResult =
  | { kind: 'saved'; commit: string; tooltips: Tooltip[] }
  | { kind: 'conflicts'; conflicts: z.infer<typeof conflictSchema>[] }
  | { kind: 'retry'; error: string };

const sessionKey = 'clarity-editor-session';
export function setSession(token: string): void {
  sessionStorage.setItem(sessionKey, z.string().min(1).max(8192).parse(token));
}
export function clearSession(): void {
  sessionStorage.removeItem(sessionKey);
}
function authorization(): Record<string, string> {
  const token = sessionStorage.getItem(sessionKey);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function endpoint(path: string): string {
  if (!apiUrl) throw new Error('VITE_API_URL is not configured. This app is read-only.');
  return `${apiUrl}${path}`;
}

export function apiRequest(path: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  for (const [name, value] of Object.entries(authorization())) headers.set(name, value);
  return fetch(endpoint(path), { ...init, credentials: 'omit', headers });
}

async function failure(response: Response): Promise<never> {
  throw new Error(`API HTTP ${response.status}: ${await response.text()}`);
}

export function loginUrl(): string {
  return endpoint('/auth/login');
}

export async function getMe(): Promise<User | null> {
  const response = await fetch(endpoint('/me'), {
    credentials: 'omit',
    headers: authorization(),
  });
  if (response.status === 401) return null;
  if (!response.ok) return failure(response);
  return userSchema.parse(await response.json());
}

export async function save(changes: Change[], message: string): Promise<SaveResult> {
  const response = await fetch(endpoint('/save'), {
    method: 'POST',
    credentials: 'omit',
    headers: { ...authorization(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ changes, message }),
  });
  if (response.status === 409) {
    const data = z
      .union([z.object({ conflicts: z.array(conflictSchema) }), z.object({ error: z.string() })])
      .parse(await response.json());
    return 'conflicts' in data ? { kind: 'conflicts', ...data } : { kind: 'retry', ...data };
  }
  if (!response.ok) return failure(response);
  const data = z
    .object({
      commit: z.string(),
      tooltips: z.array(tooltipSchema),
    })
    .parse(await response.json());
  return { kind: 'saved', ...data };
}
