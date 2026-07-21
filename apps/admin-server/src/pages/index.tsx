import { GetServerSideProps } from 'next';

import { clientSignIn } from '../auth-context';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Logo } from '../components/ui/logo';

type LoginPageProps = {
  logoUrl: string | null;
};

export const getServerSideProps: GetServerSideProps<
  LoginPageProps
> = async () => {
  let logoUrl: string | null = null;
  try {
    const apiUrl = process.env.API_URL_INTERNAL || process.env.API_URL;
    const response = await fetch(`${apiUrl}/api/project/1/branding`);
    if (response.ok) {
      const data = await response.json();
      logoUrl = data.logo || null;
    }
  } catch {}
  return { props: { logoUrl } };
};

export default function Home({ logoUrl }: LoginPageProps) {
  return (
    <main
      className="flex min-h-screen items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: 'url(/login-background.jpg)' }}>
      <Card className="w-full max-w-lg border-0 shadow-lg">
        <CardContent className="flex flex-col gap-6 p-10">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt="Logo"
              className="h-12 w-auto self-start object-contain"
            />
          ) : (
            <Logo />
          )}
          <div>
            <h1 className="text-xl font-bold text-foreground">
              Welkom bij OpenStad
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Je bent niet ingelogd. Klik op de knop om in te loggen.
            </p>
          </div>
          <Button onClick={() => clientSignIn()} className="self-start">
            Inloggen
          </Button>
          <p className="text-sm text-muted-foreground">
            Meer over{' '}
            <a
              href="https://openstad.org"
              target="_blank"
              rel="noopener noreferrer"
              className="underline">
              OpenStad.org
            </a>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
