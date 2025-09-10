'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {FolderOpen, LogOut, Users, AlertTriangle, Settings} from 'lucide-react';
import { Logo } from './logo';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useContext, useEffect, useState } from 'react';
import { SessionContext } from '../../auth';

export function Sidenav({
  className,
  narrow,
}: {
  className?: string;
  narrow?: boolean;
}) {
  const router = useRouter();
  const [location, setLocation] = useState('');
  const sessionData = useContext(SessionContext);

  useEffect(() => {
    setLocation(router.pathname);
  }, [router]);

  return (
    <nav
      className={cn(
        'fixed -translate-x-72 w-64 border-r border-border min-h-full max-h-screen md:sticky md:-translate-x-0 z-50 bg-background top-0 flex flex-col',
        className,
        narrow ? 'w-auto' : null
      )}>
      <div className="flex flex-col items-center justify-center h-24">
        <Link href="/projects" title="OpenStad - Ga naar projectenoverzicht">
          <Logo iconOnly={narrow} />
        </Link>
      </div>
      <div
        className={cn(
          'p-4 flex flex-col gap-2',
          narrow ? 'items-center' : null
        )}>
        <Link href="/projects">
          <Button
            variant={location.startsWith('/projects') ? 'secondary' : 'ghost'}
            className={cn(
              'w-full flex flex-row justify-start',
              narrow ? 'p-0 h-10 w-10 justify-center' : null
            )}>
            <FolderOpen
              size="20"
              className={
                location.startsWith('/projects')
                  ? 'text-brand'
                  : 'text-foreground'
              }
            />
            {narrow ? '' : 'Projecten'}
          </Button>
        </Link>
        {sessionData?.role == 'superuser' ? (
        <Link href="/users">
          <Button
            variant={location.startsWith('/users') ? 'secondary' : 'ghost'}
            className={cn(
              'w-full flex flex-row justify-start',
              narrow ? 'p-0 h-10 w-10 justify-center' : null
            )}>
            <Users
              size="20"
              className={
                location.startsWith('/users') ? 'text-brand' : 'text-foreground'
              }
            />
            {narrow ? '' : 'Gebruikers'}
          </Button>
        </Link>
        ) : null }
        {sessionData?.role == 'superuser' ? (
        <Link href="/issues">
          <Button
            variant={location.startsWith('/issues') ? 'secondary' : 'ghost'}
            className={cn(
              'w-full flex flex-row justify-start',
              narrow ? 'p-0 h-10 w-10 justify-center' : null
            )}>
            <AlertTriangle
              size="20"
              className={
                location.startsWith('/issues') ? 'text-brand' : 'text-foreground'
              }
            />
            {narrow ? '' : 'Problemen'}
          </Button>
        </Link>
        ) : null }
        {sessionData?.role == 'superuser' ? (
          <Link href="/settings">
            <Button
              variant={location.startsWith('/settings') ? 'secondary' : 'ghost'}
              className={cn(
                'w-full flex flex-row justify-start',
                narrow ? 'p-0 h-10 w-10 justify-center' : null
              )}>
              <Settings
                size="20"
                className={
                  location.startsWith('/settings') ? 'text-brand' : 'text-foreground'
                }
              />
              {narrow ? '' : 'Instellingen'}
            </Button>
          </Link>
        ) : null }
      </div>
      <div className="flex-grow"></div>
      <div
        className={cn(
          'p-4 flex flex-col gap-2',
          narrow ? 'items-center' : null,
          process.env.NEXT_PUBLIC_OPENSTAD_VERSION ? 'pb-6' : null
        )}>
        <Link href="/signout">
          <Button
            variant="ghost"
            className={cn(
              'w-full flex flex-row justify-start',
              narrow ? 'p-0 h-10 w-10 justify-center' : null
            )}>
            <LogOut size="20" className="text-foreground" />
            {narrow ? '' : 'Uitloggen'}
          </Button>
        </Link>

        {process.env.NEXT_PUBLIC_OPENSTAD_VERSION &&
          <p className={cn('absolute left-0 right-0 bottom-2 text-center text-gray-400 text-xs')}>
            v{process.env.NEXT_PUBLIC_OPENSTAD_VERSION}
          </p>
        }
      </div>
    </nav>
  );
}
