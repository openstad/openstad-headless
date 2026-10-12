import { describe, expect, it } from 'vitest';

import { readCreated, readJson } from './read-json';

describe('readJson', () => {
  it('returns the JSON body', async () => {
    const res = new Response(JSON.stringify({ id: 4 }), { status: 200 });
    await expect(readJson(res, 'Mislukt.')).resolves.toEqual({ id: 4 });
  });

  it('returns a JSON error body, so callers can still read it', async () => {
    const res = new Response(JSON.stringify({ status: 500 }), { status: 500 });
    await expect(readJson(res, 'Mislukt.')).resolves.toEqual({ status: 500 });
  });

  it('throws the given message when the body is not JSON', async () => {
    const res = new Response('<html>Bad Gateway</html>', { status: 502 });
    await expect(readJson(res, 'Mislukt.')).rejects.toThrow(
      new Error('Mislukt.')
    );
  });

  it('readCreated throws the message for an error answer, also as JSON', async () => {
    const res = new Response(JSON.stringify({ status: 500 }), { status: 500 });
    await expect(readCreated(res, 'Mislukt.')).rejects.toThrow(
      new Error('Mislukt.')
    );
    const ok = new Response(JSON.stringify({ id: 5 }), { status: 200 });
    await expect(readCreated(ok, 'Mislukt.')).resolves.toEqual({ id: 5 });
  });
});
