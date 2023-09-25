"use client";
import React from "react";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/router";
import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { ArrowLeft, ChevronDown } from "lucide-react";

export function SidenavProject({ className }: { className?: string }) {
  const router = useRouter();
  const [location, setLocation] = useState("");

  useEffect(() => {
    setLocation(router.pathname);
  }, [router]);

  return (
    <nav
      className={cn(
        "fixed -translate-x-72 w-64 border-r border-border min-h-full max-h-screen md:sticky md:-translate-x-0 z-50 bg-background top-0 flex flex-col",
        className
      )}
    >
      <div className="flex flex-col items-start justify-center h-24">
        <Link href="/projects">
          <div className="m-4 p-3 bg-secondary rounded">
            <ArrowLeft size={20} />
          </div>
        </Link>
      </div>
      <div className="p-4 flex flex-col gap-2">
        <Link href={"/projects/1/widgets"}>
          <Button
            variant={location.endsWith("/widgets") ? "secondary" : "ghost"}
            size="default"
            className="w-full flex justify-start"
          >
            <span className="truncate">Widgets</span>
          </Button>
        </Link>
        <Link href={"/projects/1/settings"}>
          <Button
            variant={location.includes("/settings") ? "secondary" : "ghost"}
            size="default"
            className="w-full flex justify-between"
          >
            <span className="truncate">Instellingen</span>
            <ChevronDown
              size={16}
              className={
                location.includes("/settings")
                  ? "rotate-180 duration-200"
                  : null
              }
            />
          </Button>
        </Link>
        {location.includes("/settings") ? (
          <>
            <Link href={"/projects/1/settings"}>
              <Button
                variant={location.endsWith("/settings") ? "secondary" : "ghost"}
                size="default"
                className="w-full flex justify-start pl-8"
              >
                <span className="truncate">Algemeen</span>
              </Button>
            </Link>
            <Link href={"/projects/1/settings/ideas"}>
              <Button
                variant={
                  location.includes("/settings/ideas") ? "secondary" : "ghost"
                }
                size="default"
                className="w-full flex justify-start pl-8"
              >
                <span className="truncate">Ideeën</span>
              </Button>
            </Link>
            <Link href={"/projects/1/settings/voting"}>
              <Button
                variant={
                  location.includes("/settings/voting") ? "secondary" : "ghost"
                }
                size="default"
                className="w-full flex justify-start pl-8"
              >
                <span className="truncate">Stemmen</span>
              </Button>
            </Link>
            <Link href={"/projects/1/settings/protection"}>
              <Button
                variant={
                  location.includes("/settings/protection") ? "secondary" : "ghost"
                }
                size="default"
                className="w-full flex justify-start pl-8"
              >
                <span className="truncate">Wachtwoord protectie</span>
              </Button>
            </Link>
            <Link href={"/projects/1/settings/anonymization"}>
              <Button
                variant={
                  location.includes("/settings/anonymization") ? "secondary" : "ghost"
                }
                size="default"
                className="w-full flex justify-start pl-8"
              >
                <span className="truncate">Anonimiseer gebruikers</span>
              </Button>
            </Link>
            <Link href={"/projects/1/settings/themes"}>
              <Button
                variant={
                  location.includes("/settings/themes") ? "secondary" : "ghost"
                }
                size="default"
                className="w-full flex justify-start pl-8"
              >
                <span className="truncate">Themas en gebieden</span>
              </Button>
            </Link>
            <Link href={"/projects/1/settings/notifications"}>
              <Button
                variant={
                  location.includes("/settings/notifications") ? "secondary" : "ghost"
                }
                size="default"
                className="w-full flex justify-start pl-8"
              >
                <span className="truncate">Administrator notificaties</span>
              </Button>
            </Link>
            <Link href={"/projects/1/settings/newsletter"}>
              <Button
                variant={
                  location.includes("/settings/newsletter") ? "secondary" : "ghost"
                }
                size="default"
                className="w-full flex justify-start pl-8"
              >
                <span className="truncate">Nieuwsbrief</span>
              </Button>
            </Link>
          </>
        ) : null}

        <Link href={`/projects/1/entries`}>
          <Button
            variant={location.includes("/entries") ? "secondary" : "ghost"}
            className="w-full flex justify-start"
            onClick={(e) => {}}
          >
            <span className="truncate">Inzendingen (plannen)</span>
          </Button>
        </Link>
        <Link href={`/projects/1/email`}>
          <Button
            variant={location.includes("/email") ? "secondary" : "ghost"}
            className="w-full flex justify-start"
            onClick={(e) => {}}
          >
            <span className="truncate">E-mail</span>
          </Button>
        </Link>
        <Link href={`/projects/1/authentication`}>
          <Button
            variant={
              location.includes("/authentication") ? "secondary" : "ghost"
            }
            className="w-full flex justify-start"
            onClick={(e) => {}}
          >
            <span className="truncate">Authenticatie</span>
          </Button>
        </Link>
        <Link href={`/projects/1/anonimization`}>
          <Button
            variant={
              location.includes("/anonimization") ? "secondary" : "ghost"
            }
            className="w-full flex justify-start"
            onClick={(e) => {}}
          >
            <span className="truncate">Anonimiseren</span>
          </Button>
        </Link>
        <Link href={`/projects/1/codes`}>
          <Button
            variant={location.includes("/codes") ? "secondary" : "ghost"}
            className="w-full flex justify-start"
            onClick={(e) => {}}
          >
            <span className="truncate">Stemcodes</span>
          </Button>
        </Link>
        <Link href={`/projects/1/maps`}>
          <Button
            variant={location.includes("/maps") ? "secondary" : "ghost"}
            className="w-full flex justify-start"
            onClick={(e) => {}}
          >
            <span className="truncate">Kaarten</span>
          </Button>
        </Link>
      </div>
      <div className="flex-grow"></div>
    </nav>
  );
}
