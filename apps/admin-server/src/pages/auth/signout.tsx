import { useEffect } from 'react';

export default function Signout() {

  useEffect(() => {
    try {
      let logoutUrl = `/signout`;
      document.location.href = logoutUrl;
    } catch(err) {}
  }, []);

  return <></>;

}

