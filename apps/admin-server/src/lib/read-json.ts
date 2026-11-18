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

/** As readCreated, but an error status throws the API's own message when it sends one. */
export async function readSaved(res: Response, message: string) {
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message || message);
  }
  return readJson(res, message);
}
