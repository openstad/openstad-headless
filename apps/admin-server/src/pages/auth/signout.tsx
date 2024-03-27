import { useEffect } from 'react';

export default function Signout() {

  useEffect(() => {
    try {
      let logoutUrl = `${process.env.NEXT_PUBLIC_API_URL}/auth/project/1/logout?useAuth=default&redirectUri=${process.env.NEXT_PUBLIC_URL}/`;
      document.location.href = logoutUrl;
    } catch(err) {}
  }, []);

  return <></>;

}

