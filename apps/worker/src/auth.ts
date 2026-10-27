import { z } from 'zod';
import { base64url, signToken, verifyToken } from './crypto.js';
import { HttpError, upstreamJson } from './http.js';
import type { Env, Identity } from './types.js';

const expiry = z
  .number()
  .int()
  .refine((value) => value > Math.floor(Date.now() / 1000));
const identitySchema = z.object({ id: z.number().int().positive(), login: z.string().min(1) });
const sessionSchema = identitySchema.extend({ purpose: z.literal('session'), exp: expiry });
const stateSchema = z.object({
  purpose: z.literal('oauth'),
  exp: expiry,
  nonce: z.string().min(1),
});

export async function identity(request: Request, env: Env): Promise<Identity> {
  const authorization = request.headers.get('Authorization');
  if (!authorization?.startsWith('Bearer ')) throw new HttpError(401, 'Sign in required');
  return verifyToken(authorization.slice(7), env.SESSION_SECRET, sessionSchema);
}

function stateCookie(env: Env, value: string, maxAge: number): string {
  const secure = new URL(env.OAUTH_CALLBACK_URL).protocol === 'https:' ? '; Secure' : '';
  return `clarity_oauth=${value}; HttpOnly; SameSite=Lax; Path=/auth; Max-Age=${maxAge}${secure}`;
}

export async function login(env: Env): Promise<Response> {
  const state = await signToken(
    {
      purpose: 'oauth',
      exp: Math.floor(Date.now() / 1000) + 600,
      nonce: base64url(crypto.getRandomValues(new Uint8Array(24))),
    },
    env.SESSION_SECRET,
  );
  const url = new URL('https://github.com/login/oauth/authorize');
  url.searchParams.set('client_id', env.GITHUB_CLIENT_ID);
  url.searchParams.set('redirect_uri', env.OAUTH_CALLBACK_URL);
  url.searchParams.set('state', state);
  return new Response(null, {
    status: 302,
    headers: {
      Location: url.href,
      'Set-Cookie': stateCookie(env, state, 600),
      'Cache-Control': 'no-store',
    },
  });
}

export async function callback(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const state = url.searchParams.get('state');
  const cookie = request.headers
    .get('Cookie')
    ?.split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith('clarity_oauth='))
    ?.slice('clarity_oauth='.length);
  if (!state || state !== cookie)
    throw new HttpError(401, 'OAuth state mismatch; start sign-in again');
  await verifyToken(state, env.SESSION_SECRET, stateSchema);
  const code = url.searchParams.get('code');
  if (!code || url.searchParams.has('error'))
    throw new HttpError(400, 'GitHub authorization was not completed');
  const tokenResult = z.object({ access_token: z.string().min(1) }).safeParse(
    await upstreamJson(
      await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: env.GITHUB_CLIENT_ID,
          client_secret: env.GITHUB_CLIENT_SECRET,
          code,
          redirect_uri: env.OAUTH_CALLBACK_URL,
        }),
      }),
    ),
  );
  if (!tokenResult.success)
    throw new HttpError(401, 'GitHub did not issue an access token; sign in again');
  const user = identitySchema.parse(
    await upstreamJson(
      await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${tokenResult.data.access_token}`,
          Accept: 'application/vnd.github+json',
          'User-Agent': 'clarity-editor',
          'X-GitHub-Api-Version': '2022-11-28',
        },
      }),
    ),
  );
  const session = await signToken(
    {
      ...user,
      purpose: 'session',
      exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
    },
    env.SESSION_SECRET,
  );
  const destination = new URL(env.SITE_URL);
  if (destination.origin !== env.SITE_ORIGIN) throw new Error('SITE_URL must use SITE_ORIGIN');
  destination.hash = `/auth/callback?session=${encodeURIComponent(session)}`;
  return new Response(null, {
    status: 302,
    headers: {
      Location: destination.href,
      'Set-Cookie': stateCookie(env, '', 0),
      'Cache-Control': 'no-store',
      'Referrer-Policy': 'no-referrer',
    },
  });
}
