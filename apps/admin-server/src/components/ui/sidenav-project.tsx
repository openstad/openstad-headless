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
        <Link href="javascript:history.back();">
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
            <span className="truncate">Projectinstellingen</span>
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
            <Link href={`/projects/${project}/settings/comments`}>
              <Button
                variant={
                  location.includes('/settings/comments') ? 'secondary' : 'ghost'
                }
                size="default"
                className="w-full flex justify-start pl-8">
                <span className="truncate">Reacties</span>
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
                <span className="truncate">E-mail instellingen</span>
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
                <span className="truncate">Inzendingsinstellingen</span>
              </Button>
            </Link>
            <Link href={`/projects/${project}/settings/map`}>
              <Button
                variant={
                  location.includes('/settings/map')
                    ? 'secondary'
                    : 'ghost'
                }
                size="default"
                className="w-full flex justify-start pl-8">
                <span className="truncate">Kaart instellingen</span>
              </Button>
            </Link>
            <Link href={`/projects/${project}/settings/alloweddomains`}>
              <Button
                variant={
                  location.includes('/settings/alloweddomains')
                    ? 'secondary'
                    : 'ghost'
                }
                size="default"
                className="w-full flex justify-start pl-8">
                <span className="truncate">Toegestane websites</span>
              </Button>
            </Link>
            <Link href={`/projects/${project}/settings/design`}>
              <Button
                variant={
                  location.includes('/settings/design')
                    ? 'secondary'
                    : 'ghost'
                }
                size="default"
                className="w-full flex justify-start pl-8">
                <span className="truncate">Vormgeving</span>
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
            <Link href={`/projects/${project}/authentication/2fa`}>
              <Button
                variant={
                  location.includes('/authentication/2fa')
                    ? 'secondary'
                    : 'ghost'
                }
                size="default"
                className="w-full flex justify-start pl-8">
                <span className="truncate">Two Factor Authenticatie</span>
              </Button>
            </Link>
            <Link href={`/projects/${project}/authentication/requiredfields`}>
              <Button
                variant={
                  location.includes('/authentication/requiredfields')
                    ? 'secondary'
                    : 'ghost'
                }
                size="default"
                className="w-full flex justify-start pl-8">
                <span className="truncate">Verplichte velden</span>
              </Button>
            </Link>
            <Link href={`/projects/${project}/authentication/loginpaginas `}>
              <Button
                variant={
                  location.includes('/authentication/loginpaginas')
                    ? 'secondary'
                    : 'ghost'
                }
                size="default"
                className="w-full flex justify-start pl-8">
                <span className="truncate">Login pagina&apos;s</span>
              </Button>
            </Link>
          </>
        ) : null}
        <Link href={`/projects/${project}/resources`}>
          <Button
            variant={location.includes('/resources') ? 'secondary' : 'ghost'}
            className="w-full flex justify-start"
            onClick={(e) => {}}>
            <span className="truncate">Inzendingen</span>
          </Button>
        </Link>
        <Link href={`/projects/${project}/unique-codes`}>
          <Button
            variant={location.includes('/unique-codes') ? 'secondary' : 'ghost'}
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
        <Link href={`/projects/${project}/statuses`}>
          <Button
            variant={location.includes('/statuses') ? 'secondary' : 'ghost'}
            className="w-full flex justify-start"
            onClick={(e) => {}}>
            <span className="truncate">Statussen</span>
          </Button>
        </Link>
        <Link href={`/projects/${project}/comments`}>
          <Button
            variant={location.includes('/comments') ? 'secondary' : 'ghost'}
            className="w-full flex justify-start"
            onClick={(e) => {}}>
            <span className="truncate">Reacties</span>
          </Button>
        </Link>
        <Link href={`/projects/${project}/submissions`}>
          <Button
            variant={location.includes('/submissions') ? 'secondary' : 'ghost'}
            className="w-full flex justify-start"
            onClick={(e) => {}}>
            <span className="truncate">Formulier inzendingen</span>
          </Button>
        </Link>
        <Link href={`/projects/${project}/choiceguide-results`}>
          <Button
            variant={location.includes('/choiceguide-results') ? 'secondary' : 'ghost'}
            className="w-full flex justify-start"
            onClick={(e) => {}}>
            <span className="truncate">Keuzewijzer inzendingen</span>
          </Button>
        </Link>
        <Link href={`/projects/${project}/notifications`}>
          <Button
            variant={
              location.includes('/notifications') ? 'secondary' : 'ghost'
            }
            size="default"
            className="w-full flex justify-start">
            <span className="truncate">Notificaties en e-mails</span>
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
