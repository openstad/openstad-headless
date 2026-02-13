import { Inter } from 'next/font/google';

import { clientSignIn } from '../auth';

const inter = Inter({ subsets: ['latin'] });

export default function Home() {
  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-between p-24 ${inter.className}`}>
      <>
        <h1 className="text-4xl font-bold">Welcome to Openstad</h1>
        <button onClick={() => clientSignIn()}>Sign in</button>
        <p className="text-xl">You are not signed in!</p>
      </>
    </main>
  );
}
