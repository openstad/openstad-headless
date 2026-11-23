/** The JSON body of a response; a body that is not JSON throws `message`. */
export async function readJson(res: Response, message: string): Promise<any> {
  try {
    return await res.json();
  } catch {
    throw new Error(message);
  }
}

/** As readJson, and an error status throws `message` too. */
export async function readCreated(res: Response, message: string) {
  if (!res.ok) throw new Error(message);
  return readJson(res, message);
}

/** Shown when something in front of the API refuses a request with an empty 403. */
export const REFUSED_BY_SERVER =
  'De server heeft dit geweigerd. Opnieuw proberen helpt niet, neem contact op met de beheerder.';

/** As readCreated, but an error status throws the API's own message when it sends one. */
export async function readSaved(res: Response, message: string) {
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    if (!body && res.status === 403) throw new Error(REFUSED_BY_SERVER);
    throw new Error(body?.message || message);
  }
  return readJson(res, message);
}
