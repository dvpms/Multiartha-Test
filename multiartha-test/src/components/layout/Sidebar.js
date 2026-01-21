"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

import { canManageUsers, canSell } from "@/features/auth/permissions";

function NavItem({ href, label }) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className={`block rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
        active
          ? "bg-zinc-900 text-white"
          : "text-zinc-700 hover:bg-zinc-100"
      }`}
    >
      {label}
    </Link>
  );
}

export default function Sidebar() {
  const { data: session } = useSession();
  const role = session?.user?.role;

  return (
    <aside className="rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm">
      <div className="px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
        Menu
      </div>
      <nav className="space-y-1">
        <NavItem href="/dashboard" label="Dashboard" />
        <NavItem href="/products" label="Produk" />
        {canSell(role) ? <NavItem href="/transactions" label="Transaksi" /> : null}
        {canManageUsers(role) ? <NavItem href="/users" label="User Management" /> : null}
      </nav>
    </aside>
  );
}
