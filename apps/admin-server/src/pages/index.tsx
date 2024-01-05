import { Inter } from 'next/font/google';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const inter = Inter({ subsets: ['latin'] });

export default function Home() {
  const { data } = useSession();

  // dit moet in elke pagina, niet alleen de home
  useEffect(() => {
    console.log('----------');
    console.log(data?.error);
    console.log(data);
    if (data?.error === "TokenFetchError" || data?.error === "TokenValidationFailed") {
      signIn(); // Force sign in to hopefully resolve error
    }
  }, [data]);

  const router = useRouter();

  if (data?.user) {
    return router.push('/projects');
  } else {
    return (
      <main
        className={`flex min-h-screen flex-col items-center justify-between p-24 ${inter.className}`}>
        <>
          <h1 className="text-4xl font-bold">Welcome to Openstad</h1>
          <button onClick={() => signIn('openstad')}>Sign in</button>
          <p className="text-xl">You are not signed in!</p>
        </>
      </main>
    );
  }
}

// import { Inter } from "next/font/google";
// import { signIn, signOut, useSession } from "next-auth/react";

// const inter = Inter({ subsets: ["latin"] });

// export default function Home() {
//   const { data } = useSession();
//   return (
//     <main
//       className={`flex min-h-screen flex-col items-center justify-between p-24 ${inter.className}`}
//     >
//       {data?.user ? (
//         <>
//           <h1 className="text-4xl font-bold">Welcome {data.user.name}</h1>
//           <p className="text-xl">You are signed in!</p>
//           <button onClick={() => signOut()}>Sign out</button>
//         </>
//       ) : (
//         <>
//           <h1 className="text-4xl font-bold">Welcome to Openstad</h1>
//           <button onClick={() => signIn("openstad")}>Sign in</button>
//           <p className="text-xl">You are not signed in!</p>
//         </>
//       )}
//     </main>
//   );
// }
