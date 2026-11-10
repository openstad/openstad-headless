import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

type UploadLimitsModule = typeof import('./upload-limits');

const jsonResponse = (body: unknown, status = 200) =>
  ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  }) as Response;

const fileOfMb = (mb: number) => ({ size: mb * 1024 * 1024 }) as File;

describe('upload-limits', () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  let uploadLimits: UploadLimitsModule;

  beforeEach(async () => {
    vi.resetModules();
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    uploadLimits = await import('./upload-limits');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('reads the limit from /api/upload-limit once and caches it', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ maxUploadSizeMb: 50 }));

    expect(await uploadLimits.getMaxUploadSizeMb()).toBe(50);
    expect(await uploadLimits.getMaxUploadSizeMb()).toBe(50);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith('/api/upload-limit');
  });

  it('rejects a file above the runtime limit', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ maxUploadSizeMb: 15 }));

    await expect(
      uploadLimits.assertUploadableSize(fileOfMb(20))
    ).rejects.toThrow(
      'Het bestand is te groot. De maximale bestandsgrootte is 15 MB.'
    );
  });

  it('accepts a file above 25 MB when the runtime limit is higher', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ maxUploadSizeMb: 50 }));

    await expect(
      uploadLimits.assertUploadableSize(fileOfMb(30))
    ).resolves.toBeUndefined();
  });

  it('skips the client-side check when the limit cannot be read', async () => {
    fetchMock.mockResolvedValue(jsonResponse({}, 500));

    expect(await uploadLimits.getMaxUploadSizeMb()).toBeNull();
    await expect(
      uploadLimits.assertUploadableSize(fileOfMb(500))
    ).resolves.toBeUndefined();
  });

  it('reports the runtime limit when the server answers 413', async () => {
    fetchMock.mockImplementation(async (url: string) =>
      url === '/api/upload-limit'
        ? jsonResponse({ maxUploadSizeMb: 15 })
        : jsonResponse({ error: 'File too large' }, 413)
    );

    await expect(
      uploadLimits.performUpload('/upload', new FormData())
    ).rejects.toThrow(
      'Het bestand is te groot. De maximale bestandsgrootte is 15 MB.'
    );
  });

  it('reports a size error without a number when the limit is unknown on 413', async () => {
    fetchMock.mockImplementation(async (url: string) =>
      url === '/api/upload-limit'
        ? jsonResponse({}, 500)
        : jsonResponse({ error: 'File too large' }, 413)
    );

    await expect(
      uploadLimits.performUpload('/upload', new FormData())
    ).rejects.toThrow(/^Het bestand is te groot\.$/);
  });
});
