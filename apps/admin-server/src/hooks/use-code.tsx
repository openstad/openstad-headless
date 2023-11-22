var environment = process.env.CLIENT_ID;

export default function useCode() {
  async function create(clientId: string, codeAmount?: string) {
    try {

        const params = new URLSearchParams();
        params.set('clientId', `${clientId}`);
        params.set('amount', `${codeAmount}`)
      const res = await fetch('/api/oauth/api/admin/unique-code?' + params.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
  } catch(err) {
    console.log(err);
  }
  }
  return { create };
}