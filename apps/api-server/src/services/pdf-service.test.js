import { createRequire } from 'node:module';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const require = createRequire(import.meta.url);
const { fetchImageAsDataUrl } = require('./pdf-service');

const IMAGE_APP_URL = 'https://img.example.org';
const IMAGE_APP_URL_INTERNAL = 'http://openstad-image-server:31450';

function imageResponse() {
  return new Response(Buffer.from('png-bytes'), {
    status: 200,
    headers: { 'content-type': 'image/png' },
  });
}

describe('fetchImageAsDataUrl', () => {
  let fetchMock;
  let originalEnv;

  beforeEach(() => {
    originalEnv = {
      IMAGE_APP_URL: process.env.IMAGE_APP_URL,
      IMAGE_APP_URL_INTERNAL: process.env.IMAGE_APP_URL_INTERNAL,
    };
    process.env.IMAGE_APP_URL = IMAGE_APP_URL;
    process.env.IMAGE_APP_URL_INTERNAL = IMAGE_APP_URL_INTERNAL;
    fetchMock = vi.fn().mockResolvedValue(imageResponse());
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    for (const [key, value] of Object.entries(originalEnv)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });

  it('fetches an image-server url through the internal url', async () => {
    const result = await fetchImageAsDataUrl(`${IMAGE_APP_URL}/image/logo.png`);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe(
      `${IMAGE_APP_URL_INTERNAL}/image/logo.png`
    );
    expect(result).toBe(
      `data:image/png;base64,${Buffer.from('png-bytes').toString('base64')}`
    );
  });

  it('fetches an internal image-server url', async () => {
    await fetchImageAsDataUrl(`${IMAGE_APP_URL_INTERNAL}/image/logo.png`);

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('does not fetch a url on another host', async () => {
    await expect(
      fetchImageAsDataUrl('https://attacker.example/logo.png')
    ).rejects.toThrow();

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('does not fetch a host that only starts with the image-server host', async () => {
    await expect(
      fetchImageAsDataUrl('https://img.example.org.attacker.example/logo.png')
    ).rejects.toThrow();

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('does not fetch anything when no image-server url is configured', async () => {
    delete process.env.IMAGE_APP_URL;
    delete process.env.IMAGE_APP_URL_INTERNAL;

    await expect(
      fetchImageAsDataUrl(`${IMAGE_APP_URL}/image/logo.png`)
    ).rejects.toThrow();

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns a data url unchanged', async () => {
    const dataUrl = 'data:image/png;base64,AAAA';

    expect(await fetchImageAsDataUrl(dataUrl)).toBe(dataUrl);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
