import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('worker client', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv('VITE_API_URL', 'https://worker.example/');
    const storage = new Map<string, string>();
    vi.stubGlobal('sessionStorage', {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
      removeItem: (key: string) => storage.delete(key),
    });
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });
  it('uses the configured login URL and credentials for /me', async () => {
    const fetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          id: 1,
          login: 'StardustD2',
          role: 'maintainer',
          languages: [],
        }),
      ),
    );
    vi.stubGlobal('fetch', fetch);
    const api = await import('./api');
    expect(api.loginUrl()).toBe('https://worker.example/auth/login');
    api.setSession('test-session');
    expect((await api.getMe())?.login).toBe('StardustD2');
    expect(fetch).toHaveBeenCalledWith('https://worker.example/me', {
      credentials: 'omit',
      headers: { Authorization: 'Bearer test-session' },
    });
    api.clearSession();
    expect(sessionStorage.getItem('clarity-editor-session')).toBeNull();
  });
  it('returns 409 conflicts as typed data without losing base/head/next', async () => {
    const tooltip = { hash: 10, text: {}, associated: [] };
    const conflicts = [
      { hash: 10, base: tooltip, head: tooltip, next: tooltip, fields: ['text.en'] },
    ];
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(JSON.stringify({ conflicts }), { status: 409 })),
    );
    const { save } = await import('./api');
    expect(await save([{ hash: 10, base: tooltip, next: tooltip }], 'test')).toEqual({
      kind: 'conflicts',
      conflicts,
    });
  });
  it('reports API errors and rejects malformed successes', async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(new Response('denied', { status: 403 }))
      .mockResolvedValueOnce(new Response('{}'));
    vi.stubGlobal('fetch', fetch);
    const { save, getMe } = await import('./api');
    await expect(save([], 'test')).rejects.toThrow('403');
    await expect(getMe()).rejects.toThrow();
  });
  it('distinguishes exhausted ref races from field conflicts and validates successful saves', async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ error: 'Concurrent writes; retry' }), { status: 409 }),
      )
      .mockResolvedValueOnce(new Response(JSON.stringify({ commit: 'abc', tooltips: [] })));
    vi.stubGlobal('fetch', fetch);
    const { save } = await import('./api');
    expect(await save([], 'test')).toEqual({ kind: 'retry', error: 'Concurrent writes; retry' });
    expect(await save([], 'test')).toEqual({ kind: 'saved', commit: 'abc', tooltips: [] });
  });
  it('does not call an unconfigured API and treats 401 as logged out', async () => {
    const fetch = vi.fn().mockResolvedValue(new Response(null, { status: 401 }));
    vi.stubGlobal('fetch', fetch);
    let api = await import('./api');
    expect(await api.getMe()).toBeNull();
    vi.resetModules();
    vi.stubEnv('VITE_API_URL', '');
    api = await import('./api');
    await expect(api.save([], 'test')).rejects.toThrow('read-only');
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
