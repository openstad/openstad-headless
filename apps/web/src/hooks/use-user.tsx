export default function useUser () { 

  async function createUser(email: string, role: string, projectId: number, nickName?: string, name?: string, phoneNumber?: string, address?: string, city?: string, postcode?: string,) {
    let url = `/api/openstad/api/project/${projectId}/user`  

    const res = await fetch(url, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: email,
          nickName: nickName,
          name: name,
          phoneNumber: phoneNumber,
          address: address,
          city: city,
          postcode: postcode,
          role: role,
        })
    })
  }


  return {createUser};
}
