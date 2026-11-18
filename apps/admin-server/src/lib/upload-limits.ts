export const UPLOAD_LIMIT_URL = '/api/upload-limit';

export const GENERIC_UPLOAD_ERROR_MESSAGE =
  'Uploaden mislukt. Probeer het opnieuw.';

export class UploadError extends Error {}

let maxUploadSizeMbCache: number | null = null;

export async function getMaxUploadSizeMb(): Promise<number | null> {
  if (maxUploadSizeMbCache !== null) return maxUploadSizeMbCache;

  try {
    const response = await fetch(UPLOAD_LIMIT_URL);
    if (!response.ok) return null;

    const body = await response.json();
    if (typeof body?.maxUploadSizeMb !== 'number') return null;

    maxUploadSizeMbCache = body.maxUploadSizeMb;
    return maxUploadSizeMbCache;
  } catch {
    return null;
  }
}

function sizeErrorMessage(maxUploadSizeMb: number | null): string {
  if (maxUploadSizeMb === null) return 'Het bestand is te groot.';
  return `Het bestand is te groot. De maximale bestandsgrootte is ${maxUploadSizeMb} MB.`;
}

export async function assertUploadableSize(file: File): Promise<void> {
  const maxUploadSizeMb = await getMaxUploadSizeMb();
  if (maxUploadSizeMb === null) return;

  if (file.size > maxUploadSizeMb * 1024 * 1024) {
    throw new UploadError(sizeErrorMessage(maxUploadSizeMb));
  }
}

export async function performUpload(
  url: string,
  formData: FormData
): Promise<any> {
  let response: Response;
  try {
    response = await fetch(url, { method: 'POST', body: formData });
  } catch {
    throw new UploadError(GENERIC_UPLOAD_ERROR_MESSAGE);
  }

  if (!response.ok) {
    if (response.status === 413) {
      throw new UploadError(sizeErrorMessage(await getMaxUploadSizeMb()));
    }
    throw new UploadError(GENERIC_UPLOAD_ERROR_MESSAGE);
  }

  try {
    return await response.json();
  } catch {
    throw new UploadError(GENERIC_UPLOAD_ERROR_MESSAGE);
  }
}
