'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AlertTriangle, FolderOpen, LogOut, Users, UnplugIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useContext, useState } from 'react';
import { SessionContext } from '../../auth';
import { Logo } from './logo';
import { useAuthProvidersEnabledCheck } from '@/hooks/use-auth-providers';

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
  const authProvidersEnabled = useAuthProvidersEnabledCheck();

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
        {sessionData?.role == 'superuser' && authProvidersEnabled === true ? (
        <Link href="/auth-providers">
          <Button
            variant={location.startsWith('/auth-providers') ? 'secondary' : 'ghost'}
            className={cn(
              'w-full flex flex-row justify-start',
              narrow ? 'p-0 h-10 w-10 justify-center' : null
            )}>
            <UnplugIcon
              size="20"
              className={
                location.startsWith('/auth-providers') ? 'text-brand' : 'text-foreground'
              }
            />
            {narrow ? '' : 'Auth providers'}
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
      </div>
    </nav>
  );
}
