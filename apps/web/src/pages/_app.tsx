import "@/styles/globals.css";
import { SessionProvider } from "next-auth/react";
import type { AppProps } from "next/app";
import { Toaster } from "react-hot-toast";
import { SWRConfig } from "swr";

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  return (
    <SessionProvider session={session}>
      <SWRConfig
        value={{
          fetcher: (
            resource: RequestInfo | URL,
            init: RequestInit | undefined
          ) => fetch(resource, init).then(async (res) => {
            if(res.ok) {
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
        }}
      >
        <Component {...pageProps} />
      </SWRConfig>
      <Toaster position="bottom-center"/>
    </SessionProvider>
  );
}
