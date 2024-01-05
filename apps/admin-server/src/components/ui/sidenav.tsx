'use client';
import React from 'react';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { FolderOpen, LogOut, Users, AlertTriangle } from 'lucide-react';
import { Logo } from './logo';
import { signOut, useSession } from "next-auth/react"

export function Sidenav({
  className,
  narrow,
}: {
  className?: string;
  narrow?: boolean;
}) {
  const { data } = useSession()
  const router = useRouter();
  const [location, setLocation] = useState('');

  useEffect(() => {
    setLocation(router.pathname);
  }, [router]);

  useEffect(() => {
    console.log('----------');
    console.log(data?.error);
    console.log(data);
    if (data?.error === "TokenFetchError" || data?.error === "TokenValidationFailed") {
      signOut(); // Force sign in to hopefully resolve error
    }
  }, [data]);

  return (
    <nav
      className={cn(
        'fixed -translate-x-72 w-64 border-r border-border min-h-full max-h-screen md:sticky md:-translate-x-0 z-50 bg-background top-0 flex flex-col',
        className,
        narrow ? 'w-auto' : null
      )}>
      <div className="flex flex-col items-center justify-center h-24">
        <Logo iconOnly={narrow} />
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
        <Link href="/users">
          <Button
            variant={location.startsWith('/users') ? 'secondary' : 'ghost'}
            className={cn(
              'w-full flex flex-row justify-start',
              narrow ? 'p-0 h-10 w-10 justify-center' : null
            )}
            onClick={() => {}}>
            <Users
              size="20"
              className={
                location.startsWith('/users') ? 'text-brand' : 'text-foreground'
              }
            />
            {narrow ? '' : 'Gebruikers'}
          </Button>
        </Link>
        <Link href="/issues">
          <Button
            variant={location.startsWith('/issues') ? 'secondary' : 'ghost'}
            className={cn(
              'w-full flex flex-row justify-start',
              narrow ? 'p-0 h-10 w-10 justify-center' : null
            )}
            onClick={() => {}}>
            <AlertTriangle
              size="20"
              className={
                location.startsWith('/issues') ? 'text-brand' : 'text-foreground'
              }
            />
            {narrow ? '' : 'Issues'}
          </Button>
        </Link>
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
            onClick={() => signOut()}
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
