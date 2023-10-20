export default function useUser () { 
  let url = `http://localhost:31430/api/admin/user`

  async function createUser(email: string, name?: string, phoneNumber?: string, address?: string, city?: string, postcode?: string,) {
    const res = await fetch(url, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            "Client_id": "123",
            "Client_secret": "123"
        },
        body: JSON.stringify({
          email: email,
          name: name,
          phoneNumber: phoneNumber,
          address: address,
          city: city,
          postcode: postcode,
        },
        )
    })
  }


  return {createUser};
}
