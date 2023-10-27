export default function useUser () { 

  async function createUser(email: string, projectId?: string, role?: string, nickName?: string, name?: string, phoneNumber?: string, address?: string, city?: string, postcode?: string) {
    
    
    let url = `/api/openstad/api/project/1/user`  

    const res = await fetch(url, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: email,
          role: role,
          nickName: nickName,
          name: name,
          phoneNumber: phoneNumber,
          address: address,
          city: city,
          postcode: postcode,
        })
    })
  }


  return {createUser};
}
