"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { getTransactions } from "@/features/transactions/client";
import { canSell } from "@/features/auth/permissions";

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

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                <th className="py-2 pr-3">Waktu</th>
                <th className="py-2 pr-3">Produk</th>
                <th className="py-2 pr-3">Qty</th>
                <th className="py-2 pr-3">Total</th>
                <th className="py-2 pr-3">User</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((t) => (
                <tr key={t.id} className="border-b border-zinc-100">
                  <td className="py-3 pr-3 text-zinc-700">
                    {new Date(t.createdAt).toLocaleString()}
                  </td>
                  <td className="py-3 pr-3 font-medium text-zinc-900">
                    {t.product?.name}
                  </td>
                  <td className="py-3 pr-3 text-zinc-700">{t.quantity}</td>
                  <td className="py-3 pr-3 text-zinc-700">Rp {t.totalPrice}</td>
                  <td className="py-3 pr-3 text-zinc-700">{t.user?.email}</td>
                </tr>
              ))}
              {!loading && rows.length === 0 ? (
                <tr>
                  <td className="py-6 text-center text-sm text-zinc-500" colSpan={5}>
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
