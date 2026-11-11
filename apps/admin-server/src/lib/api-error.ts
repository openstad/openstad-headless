/**
 * Throw the API's own error message for a failed response.
 *
 * The admin API answers a rejected write with `{ status, message }`. Without
 * this the save bar can only report a generic failure, which hides the reason
 * the server refused the change (a field that is too short, for example).
 */
export async function throwApiError(
  res: Response,
  fallback: string
): Promise<never> {
  let message = '';

  try {
    const body = await res.json();
    if (typeof body?.message === 'string') {
      message = body.message;
    }
  } catch {
    // Response had no JSON body; fall back to the generic message.
  }

  throw new Error(message || fallback);
}
