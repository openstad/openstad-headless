"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/router";
import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { FolderOpen, Settings, User, Users } from "lucide-react";
import { Logo } from "./logo";

export function Sidenav({ className }: { className?: string }) {
  const router = useRouter();
  const [location, setLocation] = useState("");

  useEffect(() => {
    setLocation(router.pathname);
  }, [router]);

  return (
    <nav
      className={cn(
        "fixed -translate-x-72 min-w-[16rem] w-48 max-w-[12rem] border-r border-border min-h-full max-h-screen md:sticky md:-translate-x-0 z-50 bg-background top-0 flex flex-col",
        className
      )}
    >
      <div className="flex flex-col items-center justify-center h-28 border-b border-border">
        <Logo />
      </div>
      <div className="p-4 flex flex-col gap-2">
        <Link href="/projects">
          <Button
            variant={location.startsWith("/projects") ? "secondary" : "ghost"}
            className="w-full flex flex-row justify-start"
          >
            <FolderOpen
              size="20"
              className={
                location.startsWith("/projects")
                  ? "text-brand"
                  : "text-foreground"
              }
            />
            Projecten
          </Button>
        </Link>
        <Link href="/users">
          <Button
            variant={location.includes("/users") ? "secondary" : "ghost"}
            className="w-full flex flex-row justify-start"
            onClick={(e) => {}}
          >
            <Users
              size="20"
              className={
                location.startsWith("/users") ? "text-brand" : "text-foreground"
              }
            />
            Gebruikers
          </Button>
        </Link>
        <Link href="settings">
          <Button
            variant={location.includes("/settings") ? "secondary" : "ghost"}
            className="w-full flex flex-row justify-start"
            onClick={(e) => {}}
          >
            <Settings
              size="20"
              className={
                location.startsWith("/settings")
                  ? "text-brand"
                  : "text-foreground"
              }
            />
            Instellingen
          </Button>
        </Link>
      </div>
      <div className="flex-grow"></div>
    </nav>
  );
}
