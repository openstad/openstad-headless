import { cn } from '@/lib/utils';
import { ReactNode, useEffect, useState } from 'react';
import { Heading } from './typography';
import { Breadcrumbs } from './breadcrumbs';
import { Sidenav } from './sidenav';
import { SidenavProject } from './sidenav-project';
import { useRouter } from 'next/router';

function pathIsSpecificProject(pathname: string) {
  return pathname.startsWith('/projects/[project]')
}

export function PageLayout({
  children,
  className,
  pageHeader,
  breadcrumbs,
  action,
}: {
  children?: ReactNode;
  className?: string;
  pageHeader: string;
  breadcrumbs: any;
  action?: ReactNode;
}) {
  const router = useRouter();
  const [hasProjectSidenav, setHasProjectSidenav] = useState(pathIsSpecificProject(router.pathname));

  useEffect(() => {
    setHasProjectSidenav(pathIsSpecificProject(router.pathname));
  }, [router]);

  return (
    <main className="flex flex-row min-h-screen bg-muted">
      <Sidenav
        narrow={hasProjectSidenav}
      />
      {hasProjectSidenav ? <SidenavProject /> : null}
      <section className="col-span-full w-full">
        <header className="h-fit md:h-24 flex flex-col justify-center border-b border-border sticky top-0 z-10 bg-background">
          <div className="flex flex-col md:flex-row justify-between container p-6">
            <div
              className={cn(
                'flex flex-col items-stretch justify-center mb-4 md:mb-0',
                className
              )}>
              <Heading size="2xl">{pageHeader}</Heading>
              <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>
            {action}
          </div>
        </header>
        {children}
      </section>
    </main>
  );
}
