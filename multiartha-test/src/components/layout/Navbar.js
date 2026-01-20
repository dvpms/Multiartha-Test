"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

import Button from "@/components/ui/Button";

export default function Navbar() {
  const { data: session, status } = useSession();

  return (
    <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/dashboard" className="font-semibold text-zinc-900">
          Inventaris
        </Link>

        <div className="flex items-center gap-3">
          {status === "authenticated" ? (
            <div className="hidden text-sm text-zinc-600 sm:block">
              {session?.user?.name} • {session?.user?.role}
            </div>
          ) : null}

          {status === "authenticated" ? (
            <Button variant="secondary" onClick={() => signOut({ callbackUrl: "/login" })}>
              Logout
            </Button>
          ) : (
            <Link
              href="/login"
              className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
