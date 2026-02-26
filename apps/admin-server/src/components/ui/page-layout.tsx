import { useProject } from '@/hooks/use-project';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/router';
import { ReactNode, useEffect, useState } from 'react';

import { Breadcrumbs } from './breadcrumbs';
import { Sidenav } from './sidenav';
import { SidenavProject } from './sidenav-project';
import { Heading } from './typography';

function pathIsSpecificProject(pathname: string) {
  return pathname.startsWith('/projects/[project]');
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
  pageHeader?: string;
  breadcrumbs: any;
  action?: ReactNode;
}) {
  const router = useRouter();
  const [hasProjectSidenav, setHasProjectSidenav] = useState(
    pathIsSpecificProject(router.pathname)
  );

  const { data: projectData } = useProject();
  const projectName = projectData?.name
    ? `Projectnaam: ${projectData.name}`
    : ``;

  useEffect(() => {
    setHasProjectSidenav(pathIsSpecificProject(router.pathname));
  }, [router]);

  return (
    <main className="flex flex-row min-h-screen bg-muted">
      <Sidenav narrow={hasProjectSidenav} />
      {hasProjectSidenav ? <SidenavProject /> : null}
      <section className="col-span-full w-full">
        <header className="h-fit md:h-24 flex flex-col justify-center border-b border-border sticky top-0 z-10 bg-background">
          <div className="flex flex-col md:flex-row justify-between container p-6">
            <div
              className={cn(
                'flex flex-col items-stretch justify-center mb-4 md:mb-0',
                className
              )}>
              <Heading size="2xl">
                {!!pageHeader ? pageHeader : projectName}
              </Heading>
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
