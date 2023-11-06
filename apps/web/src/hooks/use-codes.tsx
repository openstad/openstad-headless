export default function useCodes(projectId?: string) {
  const url = `http://localhost:31430/api/admin/unique-code`;
  let headers = new Headers()

  async function create(body: any) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': "Basic "
        },
        body: JSON.stringify({ amount: 3 }),
      });
  
      let json = await res.json()
      console.log(json);
    
  } catch(err) {
    console.log(err);
  }
  }
  return { create };
}