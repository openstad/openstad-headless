import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { Toaster } from 'react-hot-toast';
import { useState, useEffect } from 'react';
import { SWRConfig } from 'swr';

import { SessionContext, type SessionUserType, fetchSessionUser } from '../auth';

export default function App({
  Component,
  pageProps,
}: AppProps) {

  let [session, setSession] = useState({});
  useEffect(() => {
    fetchSessionUser()
      .then((result:SessionUserType) => setSession(result))
      .catch(console.error);
  }, [])

  return (
    <SessionContext.Provider value={session}>
      <SWRConfig
        value={{
          fetcher: (
            resource: RequestInfo | URL,
            init: RequestInit | undefined
          ) =>
            fetch(resource, init).then(async (res) => {
              if (res.ok) {
                return res.json();
              } else {
                const rejectedReason = await res.json();
                const error = new Error();
                error.message = JSON.stringify(rejectedReason);
                error.name = 'Something went wrong';
                error.cause = resource.toString();
                throw error;
              }
            }),
        }}>
        <Component {...pageProps} />
      </SWRConfig>
      <Toaster position="bottom-center" />
    </SessionContext.Provider>
  );
}
