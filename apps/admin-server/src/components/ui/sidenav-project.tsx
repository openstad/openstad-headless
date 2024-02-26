'use client';
import React from 'react';

import { Button } from './button';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { ArrowLeft, ChevronDown } from 'lucide-react';

export function SidenavProject({ className }: { className?: string }) {
  const router = useRouter();
  const { project } = router.query;
  const [location, setLocation] = useState('');

  useEffect(() => {
    setLocation(router.pathname);
  }, [router]);

  return (
    <nav
      className={cn(
        'fixed -translate-x-72 w-64 border-r border-border min-h-full max-h-screen md:sticky md:-translate-x-0 z-50 bg-background top-0 flex flex-col',
        className
      )}>
      <div className="flex flex-col items-start justify-center h-24">
        <Link href="/projects">
          <div className="m-4 p-3 bg-secondary rounded">
            <ArrowLeft size={20} />
          </div>
        </Link>
      </div>
      <div className="p-4 flex flex-col gap-2">
        <Link href={`/projects/${project}/widgets`}>
          <Button
            variant={location.endsWith('/widgets') ? 'secondary' : 'ghost'}
            size="default"
            className="w-full flex justify-start">
            <span className="truncate">Widgets</span>
          </Button>
        </Link>
        <Link href={`/projects/${project}/settings`}>
          <Button
            variant={location.includes('/settings') ? 'secondary' : 'ghost'}
            size="default"
            className="w-full flex justify-between">
            <span className="truncate">Instellingen</span>
            <ChevronDown
              size={16}
            />
          </Button>
        </Link>
        {location.includes('/settings') ? (
          <>
            <Link href={`/projects/${project}/settings`}>
              <Button
                variant={location.endsWith('/settings') ? 'secondary' : 'ghost'}
                size="default"
                className="w-full flex justify-start pl-8">
                <span className="truncate">Algemeen</span>
              </Button>
            </Link>
            <Link href={`/projects/${project}/settings/voting`}>
              <Button
                variant={
                  location.includes('/settings/voting') ? 'secondary' : 'ghost'
                }
                size="default"
                className="w-full flex justify-start pl-8">
                <span className="truncate">Stemmen</span>
              </Button>
            </Link>
            <Link href={`/projects/${project}/settings/anonymization`}>
              <Button
                variant={
                  location.includes('/settings/anonymization')
                    ? 'secondary'
                    : 'ghost'
                }
                size="default"
                className="w-full flex justify-start pl-8">
                <span className="truncate">Anonimiseer gebruikers</span>
              </Button>
            </Link>
            <Link href={`/projects/${project}/settings/notifications`}>
              <Button
                variant={
                  location.includes('/settings/notifications')
                    ? 'secondary'
                    : 'ghost'
                }
                size="default"
                className="w-full flex justify-start pl-8">
                <span className="truncate">Administrator notificaties</span>
              </Button>
            </Link>
            <Link href={`/projects/${project}/settings/resource`}>
              <Button
                variant={
                  location.includes('/settings/resource')
                    ? 'secondary'
                    : 'ghost'
                }
                size="default"
                className="w-full flex justify-start pl-8">
                <span className="truncate">Resource instellingen</span>
              </Button>
            </Link>
          </>
        ) : null}
        <Link href={`/projects/${project}/authentication`}>
          <Button
            variant={
              location.includes('/authentication') ? 'secondary' : 'ghost'
            }
            size="default"
            className="w-full flex justify-between">
            <span className="truncate">Authenticatie</span>
            <ChevronDown
              size={16}
            />
          </Button>
        </Link>
        {location.includes('/authentication') ? (
          <>
            <Link href={`/projects/${project}/authentication`}>
              <Button
                variant={
                  location.endsWith('/authentication') ? 'secondary' : 'ghost'
                }
                size="default"
                className="w-full flex justify-start pl-8">
                <span className="truncate">Algemeen</span>
              </Button>
            </Link>
            <Link href={`/projects/${project}/authentication/requiredfield`}>
              <Button
                variant={
                  location.includes('/authentication/requiredfield')
                    ? 'secondary'
                    : 'ghost'
                }
                size="default"
                className="w-full flex justify-start pl-8">
                <span className="truncate">Verplichte velden</span>
              </Button>
            </Link>
            <Link href={`/projects/${project}/authentication/uniquecode`}>
              <Button
                variant={
                  location.includes('/authentication/uniquecode')
                    ? 'secondary'
                    : 'ghost'
                }
                size="default"
                className="w-full flex justify-start pl-8">
                <span className="truncate">Unieke codes</span>
              </Button>
            </Link>
            <Link href={`/projects/${project}/authentication/loginmail`}>
              <Button
                variant={
                  location.includes('/authentication/loginmail')
                    ? 'secondary'
                    : 'ghost'
                }
                size="default"
                className="w-full flex justify-start pl-8">
                <span className="truncate">Login mail</span>
              </Button>
            </Link>
            <Link href={`/projects/${project}/authentication/smsverification`}>
              <Button
                variant={
                  location.includes('/authentication/smsverification')
                    ? 'secondary'
                    : 'ghost'
                }
                size="default"
                className="w-full flex justify-start pl-8">
                <span className="truncate">SMS verificatie</span>
              </Button>
            </Link>
          </>
        ) : null}
        <Link href={`/projects/${project}/resources`}>
          <Button
            variant={location.includes('/resources') ? 'secondary' : 'ghost'}
            className="w-full flex justify-start"
            onClick={(e) => {}}>
            <span className="truncate">Resources</span>
          </Button>
        </Link>
        <Link href={`/projects/${project}/codes`}>
          <Button
            variant={location.includes('/codes') ? 'secondary' : 'ghost'}
            className="w-full flex justify-start"
            onClick={(e) => {}}>
            <span className="truncate">Stemcodes</span>
          </Button>
        </Link>
        <Link href={`/projects/${project}/votes`}>
          <Button
            variant={location.includes('/votes') ? 'secondary' : 'ghost'}
            className="w-full flex justify-start"
            onClick={(e) => {}}>
            <span className="truncate">Stemmen</span>
          </Button>
        </Link>
        <Link href={`/projects/${project}/areas`}>
          <Button
            variant={location.includes('/areas') ? 'secondary' : 'ghost'}
            className="w-full flex justify-start"
            onClick={(e) => {}}>
            <span className="truncate">Polygonen</span>
          </Button>
        </Link>
        <Link href={`/projects/${project}/tags`}>
          <Button
            variant={location.includes('/tags') ? 'secondary' : 'ghost'}
            className="w-full flex justify-start"
            onClick={(e) => {}}>
            <span className="truncate">Tags</span>
          </Button>
        </Link>
        <Link href={`/projects/${project}/comments`}>
          <Button
            variant={location.includes('/comments') ? 'secondary' : 'ghost'}
            className="w-full flex justify-start"
            onClick={(e) => {}}>
            <span className="truncate">Argumenten</span>
          </Button>
        </Link>
        <Link href={`/projects/${project}/notifications`}>
          <Button
            variant={
              location.includes('/notifications') ? 'secondary' : 'ghost'
            }
            size="default"
            className="w-full flex justify-start">
            <span className="truncate">Notificaties</span>
          </Button>
        </Link>
        <Link href={`/projects/${project}/duplicate`}>
          <Button
            variant={location.includes("/duplicate") ? "secondary" : "ghost"}
            className="w-full flex justify-start"
            onClick={(e) => {}}
          >
            <span className="truncate">Dupliceren</span>
          </Button>
        </Link>
        <Link href={`/projects/${project}/export`}>
          <Button
            variant={location.includes("/export") ? "secondary" : "ghost"}
            className="w-full flex justify-start"
            onClick={(e) => {}}
          >
            <span className="truncate">Exporteren</span>
          </Button>
        </Link>
      </div>
      <div className="flex-grow"></div>
    </nav>
  );
}
