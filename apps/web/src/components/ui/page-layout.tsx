import { cn } from "@/lib/utils";
import { ReactNode, useEffect, useState } from "react";
import { Heading } from "./typography";
import { Breadcrumbs } from "./breadcrumbs";
import { Sidenav } from "./sidenav";
import { SidenavProject } from "./sidenav-project";
import { useRouter } from "next/router";

export function PageLayout({
  children,
  className,
  pageHeader,
  breadcrumbs,
  action,
}: {
  children: ReactNode;
  className?: string;
  pageHeader: string;
  breadcrumbs: any;
  action?: ReactNode;
}) {
  const [openSideMenu, setOpenSideMenu] = useState(false);

  const router = useRouter();
  const [location, setLocation] = useState("");
  const [hasProjectSidenav, setHasProjectSidenav] = useState(false);

  useEffect(() => {
    setHasProjectSidenav(location.startsWith("/projects/[project]"));
  });

  useEffect(() => {
    setLocation(router.pathname);
  }, [router]);

  return (
    <main className="flex flex-row min-h-screen bg-muted">
      <Sidenav
        narrow={hasProjectSidenav}
        className={openSideMenu ? "translate-x-0" : ""}
      />
      {hasProjectSidenav ? <SidenavProject /> : null}
      <section className="col-span-full w-full">
        <header className="h-24 flex flex-col justify-center border-b border-border sticky top-0 z-10 bg-background">
          <div className="flex flex-row items-center justify-between container p-6">
            <div
              className={cn(
                "flex flex-col items-stretch justify-center",
                className
              )}
            >
              <Heading size="2xl">{pageHeader}</Heading>
              <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>
            <div className="flex flex-row items-center gap-4">{action}</div>
          </div>
        </header>
        {children}
      </section>
    </main>
  );
}
