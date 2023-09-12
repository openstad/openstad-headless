'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { List, Settings, User } from 'lucide-react'

export function Sidenav({ className }: { className?: string }) {
  const router = useRouter();
  const [location, setLocation] = useState('');
  const isSuperUser = true;
  const canManageProjects = true;
  const canManageUsers = true;

  useEffect(() => {
    setLocation(router.pathname);
  }, [router]);

  return (
    <nav
      className={cn(
        'fixed -translate-x-72 min-w-[18rem] w-72 max-w-[18rem] border-r border-border min-h-full max-h-screen md:sticky md:-translate-x-0 z-50 bg-background top-0 flex flex-col',
        className
      )}>
      <div className="px-4 py-4 flex flex-col flex-grow gap-2">
        <Separator className="my-2" />
        {isSuperUser && (
          <Button
            variant={
                location.startsWith('/projects') ? 'default' : 'ghost'
            }
            size="default"
            className="w-full flex justify-start"
            asChild>
              <Link href="/projects">
                <List />
                Projecten
              </Link>
          </Button>
        )}
        {canManageProjects && (
          <Button
            variant={location.includes('/users') ? 'default' : 'ghost'}
            size={'default'}
            className="w-full flex justify-start"
            onClick={(e) => {
            }}
            asChild>
              <Link href={`/users`}>
                <User />
                Gebruikers
              </Link>
          </Button>
        )}
        {canManageUsers && (
          <Button
            variant={location.includes('/settings') ? 'default' : 'ghost'}
            size={'default'}
            className="w-full flex justify-start"
            onClick={(e) => {
            }}
            asChild>
              <Link href={`/settings`}>
                <Settings />
                Instellingen
              </Link>
          </Button>
        )}
        <div className="flex-grow"></div>
      </div>
      </nav>
  );
}