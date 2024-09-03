'use client';
import React from 'react';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { FolderOpen, LogOut, Users, AlertTriangle } from 'lucide-react';
import { Logo } from './logo';
import { useContext } from 'react';
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
      </div>
      <div className="flex-grow"></div>
      <div
        className={cn(
          'p-4 flex flex-col gap-2',
          narrow ? 'items-center' : null
        )}>
        <Link href="/projects">
          <Button
            variant="ghost"
            onClick={() => router.push('/signout')}
            className={cn(
              'w-full flex flex-row justify-start',
              narrow ? 'p-0 h-10 w-10 justify-center' : null
            )}>
            <LogOut size="20" className="text-foreground" />
            {narrow ? '' : 'Uitloggen'}
          </Button>
        </Link>
      </div>
    </nav>
  );
}
