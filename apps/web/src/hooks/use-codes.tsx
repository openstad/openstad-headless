export default function useCodes(projectId?: string) {
  const url = `http://localhost:31430/api/admin/unique-code`;
  let headers = new Headers()

  async function create(body: any) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': "Basic dW5pcXVlY29kZTp1bmlxdWVjb2RlMTIz"
        },
        body: JSON.stringify({ code: 'a1a1a1a1', clientId: 1 }),
      });
  
      let json = await res.json()
      console.log(json);
    
  } catch(err) {
    console.log(err);
  }
  }
  return { create };
}