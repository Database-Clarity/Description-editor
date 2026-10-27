import { beforeEach, expect, it, vi } from 'vitest';
import { apiRequest } from './api';
import { getPermissions, putPermissions, resolveGitHubLogin } from './permissions';

vi.mock('./api', () => ({ apiRequest: vi.fn() }));
const config = { users: { 1: { login: 'owner', role: 'maintainer' as const } } };

beforeEach(() => {
  vi.resetAllMocks();
  vi.unstubAllGlobals();
});

it('loads validated permissions and submits the whole document with PUT', async () => {
  vi.mocked(apiRequest)
    .mockResolvedValueOnce(Response.json(config))
    .mockResolvedValueOnce(Response.json({ commit: 'abc', permissions: config }));
  expect(await getPermissions()).toEqual(config);
  expect(await putPermissions(config)).toEqual(config);
  expect(apiRequest).toHaveBeenLastCalledWith('/permissions', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  });
});

it('rejects last-maintainer deletion locally and surfaces server errors', async () => {
  await expect(putPermissions({ users: {} })).rejects.toThrow('maintainer');
  expect(apiRequest).not.toHaveBeenCalled();
  vi.mocked(apiRequest).mockResolvedValue(new Response('Permission denied', { status: 403 }));
  await expect(getPermissions()).rejects.toThrow('403: Permission denied');
});

it('resolves the canonical GitHub login/id without forwarding editor authorization', async () => {
  const fetch = vi.fn().mockResolvedValue(Response.json({ id: 42, login: 'ActualLogin' }));
  vi.stubGlobal('fetch', fetch);
  expect(await resolveGitHubLogin(' actualLogin ')).toEqual({ id: 42, login: 'ActualLogin' });
  expect(fetch).toHaveBeenCalledWith('https://api.github.com/users/actualLogin', {
    credentials: 'omit',
    headers: { Accept: 'application/vnd.github+json' },
  });
  await expect(resolveGitHubLogin('https://github.com/account')).rejects.toThrow('GitHub login');
  expect(fetch).toHaveBeenCalledTimes(1);
});

it('does not silently accept GitHub errors or malformed account responses', async () => {
  const fetch = vi
    .fn()
    .mockResolvedValueOnce(new Response('missing', { status: 404 }))
    .mockResolvedValueOnce(Response.json({ id: 'not-numeric', login: 'who' }));
  vi.stubGlobal('fetch', fetch);
  await expect(resolveGitHubLogin('missing')).rejects.toThrow('HTTP 404');
  await expect(resolveGitHubLogin('who')).rejects.toThrow();
});
