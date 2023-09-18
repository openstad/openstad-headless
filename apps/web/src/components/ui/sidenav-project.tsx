'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from './dropdown-menu';

export function SidenavProject({ className }: { className?: string }) {
  const router = useRouter();
  const [location, setLocation] = useState('');

  useEffect(() => {
    setLocation(router.pathname);
  }, [router]);

  return (
    <nav
      className={cn(
        'fixed -translate-x-72 min-w-[15rem] w-60 max-w-[15rem] border-r border-border min-h-full max-h-screen md:sticky md:-translate-x-0 z-50 bg-background top-0 flex flex-col',
        className
      )}>
      <div className="px-4 py-4 flex flex-col flex-grow gap-2">
        <Separator className="my-2" />
          <Button
            variant={
                location.endsWith('/widgets') ? 'sidebar' : 'ghost'
            }
            size="default"
            className="w-full flex justify-start"
            asChild>
              <Link href={"/projects/1/widgets"}>
                Widgets
              </Link>
          </Button>
          <Button
            variant={location.includes('/settings') ? 'sidebar' : 'ghost'}
            size={'default'}
            className="w-full flex justify-start"
            onClick={(e) => {
            }}
            asChild>
              <DropdownMenu>
                <DropdownMenuTrigger>Instellingen</DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>
                    <Link href={"/projects/1/settings"}>
                      General
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href={"/projects/1/settings/ideas"}>
                      Ideeën
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href={"/projects/1/settings/voting"}>
                      Stemmen
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href={"/projects/1/settings/protection"}>
                      Wachtwoord protectie
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href={"/projects/1/settings/anonymization"}>
                      Anonimizeren gebruikers
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href={"/projects/1/settings/themes"}>
                      Themas en gebieden
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href={"/projects/1/settings/notifications"}>
                      Admin notificaties
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href={"/projects/1/settings/newsletter"}>
                      Nieuwsbrief
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
          </Button>
          <Button
            variant={location.includes('/entries') ? 'sidebar' : 'ghost'}
            size={'default'}
            className="w-full flex justify-start"
            onClick={(e) => {
            }}
            asChild>
              <Link href={`/projects/1/entries`}>
                Inzendingen (plannen)
              </Link>
          </Button>
          <Button
            variant={location.includes('/email') ? 'sidebar' : 'ghost'}
            size={'default'}
            className="w-full flex justify-start"
            onClick={(e) => {
            }}
            asChild>
              <Link href={`/projects/1/email`}>
                E-mail
              </Link>
          </Button>
          <Button
            variant={location.includes('/authentication') ? 'sidebar' : 'ghost'}
            size={'default'}
            className="w-full flex justify-start"
            onClick={(e) => {
            }}
            asChild>
              <Link href={`/projects/1/authentication`}>
                Authenticatie
              </Link>
          </Button>
          <Button
            variant={location.includes('/anonimization') ? 'sidebar' : 'ghost'}
            size={'default'}
            className="w-full flex justify-start"
            onClick={(e) => {
            }}
            asChild>
              <Link href={`/projects/1/anonimization`}>
                Anonimiseren
              </Link>
          </Button>
          <Button
            variant={location.includes('/codes') ? 'sidebar' : 'ghost'}
            size={'default'}
            className="w-full flex justify-start"
            onClick={(e) => {
            }}
            asChild>
              <Link href={`/projects/1/codes`}>
                Stemcodes
              </Link>
          </Button>
          <Button
            variant={location.includes('/maps') ? 'sidebar' : 'ghost'}
            size={'default'}
            className="w-full flex justify-start"
            onClick={(e) => {
            }}
            asChild>
              <Link href={`/projects/1/maps`}>
                Kaarten
              </Link>
          </Button>
        <div className="flex-grow"></div>
      </div>
      </nav>
  );
}