"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { getTransactions } from "@/features/transactions/client";
import { canSell } from "@/features/auth/permissions";
import { formatDateTimeId, formatRupiah } from "@/lib/format";

export default function TransactionsClient() {
  const { data: session } = useSession();
  const role = session?.user?.role;

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const canView = canSell(role); // Admin/Seller

  async function load() {
    setLoading(true);
    try {
      const tx = await getTransactions();
      setItems(tx);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!canView) return;
    load();
  }, [canView]);

  const rows = useMemo(() => items || [], [items]);

  if (!canView) {
    return (
      <Card>
        <h1 className="text-xl font-semibold text-zinc-900">Transaksi</h1>
        <p className="mt-1 text-sm text-zinc-600">Akses ditolak.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">Transaksi</h1>
          <p className="text-sm text-zinc-600">Log audit penjualan (latest).</p>
        </div>
        <Button variant="secondary" onClick={load} disabled={loading}>
          Refresh
        </Button>
      </div>

      <Card>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-900">History</h2>
          {loading ? <span className="text-sm text-zinc-500">Loading...</span> : null}
        </div>

        <div className="mt-4 max-h-[70vh] overflow-auto rounded-xl border border-zinc-100">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 z-10 bg-white/90 backdrop-blur">
              <tr className="border-b border-zinc-200 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                <th className="px-3 py-2">Waktu</th>
                <th className="px-3 py-2">Produk</th>
                <th className="px-3 py-2 text-right">Qty</th>
                <th className="px-3 py-2 text-right">Total</th>
                <th className="px-3 py-2">User</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((t) => (
                <tr
                  key={t.id}
                  className="border-b border-zinc-100 odd:bg-zinc-50/50 hover:bg-zinc-50"
                >
                  <td className="px-3 py-3 whitespace-nowrap text-zinc-700">
                    {formatDateTimeId(t.createdAt)}
                  </td>
                  <td className="px-3 py-3 font-medium text-zinc-900">
                    {t.product?.name}
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums text-zinc-700">{t.quantity}</td>
                  <td className="px-3 py-3 text-right tabular-nums text-zinc-700">
                    {formatRupiah(t.totalPrice)}
                  </td>
                  <td className="px-3 py-3 text-zinc-700">{t.user?.email}</td>
                </tr>
              ))}
              {!loading && rows.length === 0 ? (
                <tr>
                  <td className="px-3 py-10 text-center text-sm text-zinc-500" colSpan={5}>
                    Belum ada transaksi.
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
