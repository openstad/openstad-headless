// Mirrors apps/image-server/server.js's MAX_FILE_UPLOAD_SIZE_MB default (25 MB).
// This is a plain constant, not a NEXT_PUBLIC_* env var: any NEXT_PUBLIC_* value
// is inlined into the browser bundle at `next build` and frozen inside a
// prebuilt Docker image, so it can never reflect a deployment's runtime env var.
// This constant and the server-side MAX_FILE_UPLOAD_SIZE_MB env var do NOT
// automatically follow each other -- changing one does not change the other.
export const MAX_UPLOAD_SIZE_MB = 25;
export const MAX_UPLOAD_SIZE_BYTES = MAX_UPLOAD_SIZE_MB * 1024 * 1024;

const SIZE_ERROR_MESSAGE = `Het bestand is te groot. De maximale bestandsgrootte is ${MAX_UPLOAD_SIZE_MB} MB.`;
export const GENERIC_UPLOAD_ERROR_MESSAGE =
  'Uploaden mislukt. Probeer het opnieuw.';

export class UploadError extends Error {}

// Throws before any network request is made, so an oversized file never
// reaches the proxy at all.
export function assertUploadableSize(file: File): void {
  if (file.size > MAX_UPLOAD_SIZE_BYTES) {
    throw new UploadError(SIZE_ERROR_MESSAGE);
  }
}

// POSTs `formData` to `url` and returns the parsed JSON body, or throws a
// normalized UploadError carrying a Dutch, user-facing message. A generic
// (non-413) failure never echoes the server's own error text: some routes
// return raw internal error messages, which must not reach the UI.
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
    // A CDN, ingress or Next.js itself can return a non-JSON (HTML or empty)
    // body on error; treat that the same as any other unreadable response.
    throw new UploadError(GENERIC_UPLOAD_ERROR_MESSAGE);
  }
}
