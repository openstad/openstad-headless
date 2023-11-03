import useSWR from 'swr';

export default function useCodes(projectId?: string) {
  const url = `http://localhost:31430/api/admin/unique-code?clientId=uniquecode&clientSecret=uniquecode123`;
  const codesSwr = useSWR(projectId ? url : null);
  let headers = new Headers()

  headers.set('Authorization', 'Basic ' + btoa("uniquecode:uniquecode123"))

  async function create(body: any) {
    const res = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({ code: 'a1a1a1a1', clientId: 1 }),
    });
  }
  return { ...codesSwr, create };
}