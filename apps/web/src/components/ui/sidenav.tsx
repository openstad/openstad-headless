'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { FolderOpen, Settings, Users } from 'lucide-react'

export function Sidenav({ className }: { className?: string }) {
  const router = useRouter();
  const [location, setLocation] = useState('');

  useEffect(() => {
    setLocation(router.pathname);
  }, [router]);

  return (
    <nav
      className={cn(
        'fixed -translate-x-72 min-w-[12rem] w-48 max-w-[12rem] border-r border-border min-h-full max-h-screen md:sticky md:-translate-x-0 z-50 bg-background top-0 flex flex-col',
        className
      )}>
      <div className="px-4 py-4 flex flex-col flex-grow gap-2">
        <Separator className="my-2" />
          <Button
            variant={location.startsWith('/projects') ? 'sidebar' : 'ghost'}
            size="default"
            className="w-full flex justify-start"
            asChild>
              <Link href="/projects">
                <FolderOpen />
                Projecten
              </Link>
          </Button>
          <Button
            variant={location.startsWith('/users') ? 'sidebar' : 'ghost'}
            size={'default'}
            className="w-full flex justify-start"
            onClick={(e) => {
            }}
            asChild>
              <Link href={`/users`}>
                <Users />
                Gebruikers
              </Link>
          </Button>
          <Button
            variant={location.startsWith('/settings') ? 'sidebar' : 'ghost'}
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
        <div className="flex-grow"></div>
      </div>
    </nav>
  );
}