import { describe, expect, it } from 'vitest';

import { readCreated, readJson, readSaved } from './read-json';

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

  it('readSaved throws the message the API sends with an error answer', async () => {
    const res = new Response(
      JSON.stringify({ status: 422, message: 'Deze url is al in gebruik.' }),
      { status: 422 }
    );
    await expect(readSaved(res, 'Mislukt.')).rejects.toThrow(
      new Error('Deze url is al in gebruik.')
    );
  });

  it('readSaved falls back to the given message without an API message', async () => {
    const noMessage = new Response(JSON.stringify({ status: 500 }), {
      status: 500,
    });
    await expect(readSaved(noMessage, 'Mislukt.')).rejects.toThrow(
      new Error('Mislukt.')
    );
    const notJson = new Response('<html>Bad Gateway</html>', { status: 502 });
    await expect(readSaved(notJson, 'Mislukt.')).rejects.toThrow(
      new Error('Mislukt.')
    );
    const ok = new Response(JSON.stringify({ id: 6 }), { status: 200 });
    await expect(readSaved(ok, 'Mislukt.')).resolves.toEqual({ id: 6 });
  });
});
