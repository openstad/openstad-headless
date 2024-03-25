import { Inter } from 'next/font/google';
const inter = Inter({ subsets: ['latin'] });
import { clientSignIn } from '../auth';

export default function Home() {
  return (
    <main
    className={`flex min-h-screen flex-col items-center justify-between p-24 ${inter.className}`}>
      <>
      <h1 className="text-4xl font-bold">Welcome to Openstad</h1>
      <button onClick={() => clientSignIn('openstad')}>Sign in</button>
      <p className="text-xl">You are not signed in!</p>
      </>
      </main>
  );
}
