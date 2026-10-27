import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { body } from '../src/http.js';

describe('bounded request parsing', () => {
  it('accepts exactly 2,000,000 bytes but rejects one byte more', async () => {
    const exact = `0${' '.repeat(1_999_999)}`;
    expect(
      await body(
        new Request('https://api.example/save', {
          method: 'POST',
          body: exact,
        }),
        z.number(),
      ),
    ).toBe(0);
    await expect(
      body(
        new Request('https://api.example/save', {
          method: 'POST',
          body: `${exact} `,
        }),
        z.number(),
      ),
    ).rejects.toMatchObject({ status: 413 });
  });

  it('cancels an oversized stream without reading the whole request', async () => {
    let reads = 0;
    const cancel = vi.fn();
    const stream = new ReadableStream<Uint8Array>(
      {
        pull(controller) {
          reads++;
          controller.enqueue(new Uint8Array(1_000_001).fill(32));
        },
        cancel,
      },
      { highWaterMark: 0 },
    );
    const init: RequestInit & { duplex: 'half' } = {
      method: 'POST',
      body: stream,
      duplex: 'half',
    };
    await expect(
      body(new Request('https://api.example/save', init), z.unknown()),
    ).rejects.toMatchObject({ status: 413 });
    expect(reads).toBe(2);
    expect(cancel).toHaveBeenCalledOnce();
  });

  it('distinguishes malformed JSON, invalid UTF-8 and invalid schemas', async () => {
    for (const value of ['not json', new Uint8Array([0xff]), '{"value":1}']) {
      await expect(
        body(
          new Request('https://api.example/save', {
            method: 'POST',
            body: value,
          }),
          z.number(),
        ),
      ).rejects.toMatchObject({ status: 400 });
    }
  });
});
