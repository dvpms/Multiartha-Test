"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { confirmDanger } from "@/lib/alert";
import { changeUserRole, getUsers } from "@/features/users/client";
import { ROLES, ROLE_NAMES } from "@/server/domain/constants/roles";

export default function UsersClient() {
  const { data: session } = useSession();
  const role = session?.user?.role;
  const actorId = session?.user?.id;

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const isAdmin = role === ROLES.ADMIN;

  async function load() {
    setLoading(true);
    try {
      const users = await getUsers();
      setItems(users);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!isAdmin) return;
    load();
  }, [isAdmin]);

  const rows = useMemo(() => items || [], [items]);

  async function onChangeRole(user) {
    const current = user.role?.name;
    const next = window.prompt(
      `Role baru untuk ${user.email} (pilihan: ${ROLE_NAMES.join(
        ", "
      )})`,
      current
    );

    if (!next || next === current) return;

    const confirm = await confirmDanger({
      title: "Konfirmasi",
      text: `Ubah role user ${user.email} dari ${current} menjadi ${next}?`,
      confirmText: "Ubah",
    });

    if (!confirm.isConfirmed) return;

    setSubmitting(true);
    try {
      await changeUserRole(user.id, next);
      toast.success("Role berhasil diubah");
      await load();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (!isAdmin) {
    return (
      <Card>
        <h1 className="text-xl font-semibold text-zinc-900">User Management</h1>
        <p className="mt-1 text-sm text-zinc-600">Akses ditolak.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">User Management</h1>
          <p className="text-sm text-zinc-600">Admin dapat mengubah role user.</p>
        </div>
        <Button variant="secondary" onClick={load} disabled={loading}>
          Refresh
        </Button>
      </div>

      <Card>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-900">Daftar User</h2>
          {loading ? <span className="text-sm text-zinc-500">Loading...</span> : null}
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                <th className="py-2 pr-3">Email</th>
                <th className="py-2 pr-3">Nama</th>
                <th className="py-2 pr-3">Role</th>
                <th className="py-2 pr-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((u) => {
                const isSelf = actorId && u.id === actorId;
                return (
                  <tr key={u.id} className="border-b border-zinc-100">
                    <td className="py-3 pr-3 font-medium text-zinc-900">{u.email}</td>
                    <td className="py-3 pr-3 text-zinc-700">{u.name}</td>
                    <td className="py-3 pr-3 text-zinc-700">{u.role?.name}</td>
                    <td className="py-3 pr-3">
                      <Button
                        variant="secondary"
                        onClick={() => onChangeRole(u)}
                        disabled={submitting || loading || isSelf}
                      >
                        {isSelf ? "Tidak bisa" : "Ubah Role"}
                      </Button>
                    </td>
                  </tr>
                );
              })}
              {!loading && rows.length === 0 ? (
                <tr>
                  <td className="py-6 text-center text-sm text-zinc-500" colSpan={4}>
                    Belum ada user.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
