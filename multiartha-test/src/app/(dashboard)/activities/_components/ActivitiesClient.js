"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Modal from "@/components/ui/Modal";
import { formatDateTimeId } from "@/lib/format";
import { getActivities } from "@/features/activities/client";
import { ROLES } from "@/server/domain/constants/roles";

function pretty(value) {
  if (value == null) return "-";
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

export default function ActivitiesClient() {
  const { data: session } = useSession();
  const role = session?.user?.role;

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  const isAdmin = role === ROLES.ADMIN;

  async function load() {
    setLoading(true);
    try {
      const data = await getActivities();
      setItems(data);
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

  if (!isAdmin) {
    return (
      <Card>
        <h1 className="text-xl font-semibold text-zinc-900">Aktivitas</h1>
        <p className="mt-1 text-sm text-zinc-600">Akses ditolak.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">Aktivitas</h1>
          <p className="text-sm text-zinc-600">Audit log perubahan sistem (latest).</p>
        </div>
        <Button variant="secondary" onClick={load} disabled={loading}>
          Refresh
        </Button>
      </div>

      <Card>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-900">Log</h2>
          {loading ? <span className="text-sm text-zinc-500">Loading...</span> : null}
        </div>

        <div className="mt-4 max-h-[70vh] overflow-auto rounded-xl border border-zinc-100">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 z-10 bg-white/90 backdrop-blur">
              <tr className="border-b border-zinc-200 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                <th className="px-3 py-2">Waktu</th>
                <th className="px-3 py-2">Actor</th>
                <th className="px-3 py-2">Entity</th>
                <th className="px-3 py-2">Action</th>
                <th className="px-3 py-2">Entity ID</th>
                <th className="px-3 py-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((a) => (
                <tr
                  key={a.id}
                  className="border-b border-zinc-100 odd:bg-zinc-50/50 hover:bg-zinc-50"
                >
                  <td className="px-3 py-3 whitespace-nowrap text-zinc-700">
                    {formatDateTimeId(a.createdAt)}
                  </td>
                  <td className="px-3 py-3 text-zinc-700" title={a.actor?.email || ""}>
                    {a.actor?.name || a.actor?.email || "System"}
                  </td>
                  <td className="px-3 py-3 font-medium text-zinc-900">{a.entityType}</td>
                  <td className="px-3 py-3 text-zinc-700">{a.action}</td>
                  <td className="px-3 py-3 font-mono text-xs text-zinc-700">{a.entityId || "-"}</td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setSelected(a);
                        setOpen(true);
                      }}
                    >
                      Detail
                    </Button>
                  </td>
                </tr>
              ))}

              {!loading && rows.length === 0 ? (
                <tr>
                  <td className="px-3 py-10 text-center text-sm text-zinc-500" colSpan={6}>
                    Belum ada aktivitas.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        title={selected ? `Detail Aktivitas: ${selected.action}` : "Detail Aktivitas"}
        open={open}
        onClose={() => {
          setOpen(false);
          setSelected(null);
        }}
      >
        <div className="space-y-4">
          <div className="text-sm text-zinc-700">
            <div>
              <span className="font-semibold">Entity:</span> {selected?.entityType}
            </div>
            <div>
              <span className="font-semibold">Entity ID:</span> {selected?.entityId || "-"}
            </div>
            <div>
              <span className="font-semibold">Actor:</span>{" "}
              {selected?.actor?.name || selected?.actor?.email || "System"}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Before
              </div>
              <pre className="max-h-72 overflow-auto rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-800">
                {pretty(selected?.before)}
              </pre>
            </div>
            <div>
              <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                After
              </div>
              <pre className="max-h-72 overflow-auto rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-800">
                {pretty(selected?.after)}
              </pre>
            </div>
          </div>

          <div>
            <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">Metadata</div>
            <pre className="max-h-72 overflow-auto rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-800">
              {pretty(selected?.metadata)}
            </pre>
          </div>
        </div>
      </Modal>
    </div>
  );
}
