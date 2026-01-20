"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { getProducts } from "@/features/products/client";
import { ROLES } from "@/server/domain/constants/roles";
import { LOW_STOCK_THRESHOLD } from "@/server/domain/constants/inventory";

export default function DashboardClient() {
  const { data: session } = useSession();
  const role = session?.user?.role;

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = role === ROLES.ADMIN;

  useEffect(() => {
    if (!isAdmin) return;

    (async () => {
      setLoading(true);
      try {
        const items = await getProducts();
        setProducts(items);
      } catch (e) {
        toast.error(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [isAdmin]);

  const lowStock = useMemo(() => {
    return (products || []).filter((p) => p.stock <= LOW_STOCK_THRESHOLD);
  }, [products]);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold text-zinc-900">Dashboard</h1>
        <p className="text-sm text-zinc-600">
          Ringkasan dan catatan operasional.
        </p>
      </div>

      {isAdmin ? (
        <Card>
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-sm font-semibold text-zinc-900">
              Catatan stok (Admin)
            </h2>
            {loading ? <span className="text-sm text-zinc-500">Loading...</span> : null}
          </div>

          {!loading && lowStock.length === 0 ? (
            <div className="mt-3 text-sm text-zinc-600">Tidak ada stok menipis.</div>
          ) : null}

          {!loading && lowStock.length > 0 ? (
            <div className="mt-3 space-y-2">
              {lowStock.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-zinc-900">
                      {p.name}
                    </div>
                    <div className="text-xs text-zinc-600">Stock: {p.stock}</div>
                  </div>
                  <div>
                    {p.stock === 0 ? (
                      <Badge variant="danger">Habis</Badge>
                    ) : (
                      <Badge variant="warning">Menipis</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </Card>
      ) : (
        <Card>
          <div className="text-sm text-zinc-600">
            Selamat datang, {session?.user?.name}. Role kamu: {role}.
          </div>
        </Card>
      )}
    </div>
  );
}
