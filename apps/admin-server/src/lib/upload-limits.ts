export const MAX_UPLOAD_SIZE_MB = 25;
export const MAX_UPLOAD_SIZE_BYTES = MAX_UPLOAD_SIZE_MB * 1024 * 1024;

const SIZE_ERROR_MESSAGE = `Het bestand is te groot. De maximale bestandsgrootte is ${MAX_UPLOAD_SIZE_MB} MB.`;
export const GENERIC_UPLOAD_ERROR_MESSAGE =
  'Uploaden mislukt. Probeer het opnieuw.';

export class UploadError extends Error {}

export function assertUploadableSize(file: File): void {
  if (file.size > MAX_UPLOAD_SIZE_BYTES) {
    throw new UploadError(SIZE_ERROR_MESSAGE);
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
      throw new UploadError(SIZE_ERROR_MESSAGE);
    }
    throw new UploadError(GENERIC_UPLOAD_ERROR_MESSAGE);
  }

  try {
    return await response.json();
  } catch {
    throw new UploadError(GENERIC_UPLOAD_ERROR_MESSAGE);
  }
}
