import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { publishableHash } from '@clarity/core';
import { Fixture, makePrivateKey, tooltip } from './fixture.js';

let key: string;
let fixture: Fixture;
beforeAll(async () => {
  key = await makePrivateKey();
});
beforeEach(() => {
  fixture = new Fixture(key);
});
afterEach(() => {
  vi.unstubAllGlobals();
});

describe('pushed history snapshots', () => {
  it('distinguishes never published from unavailable historical content', async () => {
    expect(await (await fixture.request('/history/123?live=1')).json()).toEqual({
      pushedHash: null,
      tooltip: null,
    });
    fixture.moveData({ 'live/pushed.json': { 123: 'f'.repeat(64) } });
    const response = await fixture.request('/history/123?live=1');
    expect(response.status).toBe(409);
    expect(await response.json()).toMatchObject({
      error: expect.stringContaining('could not be recovered'),
    });
  });
  it('stores the exact exported version atomically with pushed markers despite later saves', async () => {
    fixture.beforePatch = () => fixture.moveData({ 'tooltips/123.json': tooltip('newer save') });
    expect((await fixture.request('/push-live', 'POST', { hashes: [123] })).status).toBe(200);
    expect(fixture.current()['live/tooltips/123.json']).toEqual(tooltip());
    const result = await fixture.request('/history/123?live=1');
    expect(await result.json()).toEqual({
      pushedHash: await publishableHash(tooltip()),
      tooltip: tooltip(),
    });
    expect(fixture.current()['tooltips/123.json']).toEqual(tooltip('newer save'));
  });
  it('recovers old markers by matching publishable content rather than current saved text', async () => {
    fixture.moveData({
      'tooltips/123.json': tooltip('newer'),
      'live/pushed.json': { 123: await publishableHash(tooltip()) },
    });
    expect(await (await fixture.request('/history/123?live=1')).json()).toEqual({
      pushedHash: await publishableHash(tooltip()),
      tooltip: tooltip(),
    });
  });
  it('does not present a corrupt or mismatched snapshot as live text', async () => {
    fixture.moveData({
      'live/pushed.json': { 123: await publishableHash(tooltip()) },
      'live/tooltips/123.json': tooltip('not what was exported'),
    });
    expect((await fixture.request('/history/123?live=1')).status).toBe(502);
  });
  it('checks read permissions before exposing pushed history', async () => {
    expect((await fixture.request('/history/123?live=1', 'GET', undefined, 5)).status).toBe(403);
    expect((await fixture.request('/history/123?live=1', 'GET', undefined, 4)).status).toBe(200);
  });
  it('returns GitHub login/avatar independently from fallback commit author', async () => {
    const author = { login: 'alice', avatar_url: 'https://avatars.githubusercontent.com/u/1' };
    fixture.history[0].author = author;
    const result = await fixture.request('/history/123');
    expect(await result.json()).toMatchObject({
      commits: [
        { author: 'alice', login: 'alice', avatar: 'https://avatars.githubusercontent.com/u/1' },
      ],
    });
  });
  it('refuses to publish a version that changed since it was reviewed', async () => {
    const response = await fixture.request('/push-live', 'POST', {
      hashes: [123],
      expected: { 123: await publishableHash(tooltip('reviewed older version')) },
    });
    expect(response.status).toBe(409);
    expect(fixture.writes).toHaveLength(0);
    expect(fixture.commits).toHaveLength(0);
  });
  it('accepts a matching review digest while preserving the original hashes-only API', async () => {
    const response = await fixture.request('/push-live', 'POST', {
      hashes: [123],
      expected: { 123: await publishableHash(tooltip()) },
    });
    expect(response.status).toBe(200);
    expect(fixture.current()['live/tooltips/123.json']).toEqual(tooltip());
  });
});
