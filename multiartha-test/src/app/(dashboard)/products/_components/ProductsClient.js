"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Badge from "@/components/ui/Badge";
import { confirmDanger } from "@/lib/alert";
import { createProduct, getProducts, sellProduct } from "@/features/products/client";
import { ROLES } from "@/server/domain/constants/roles";
import { canSell } from "@/features/auth/permissions";

function stockBadge(stock) {
  if (stock === 0) return <Badge variant="danger">Habis</Badge>;
  if (stock <= 5) return <Badge variant="warning">Menipis</Badge>;
  return <Badge variant="success">Aman</Badge>;
}

export default function ProductsClient() {
  const { data: session } = useSession();
  const role = session?.user?.role;

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [sellQty, setSellQty] = useState({});

  const isAdmin = role === ROLES.ADMIN;
  const allowSell = canSell(role);

  const [createForm, setCreateForm] = useState({ name: "", stock: "0", price: "0" });

  async function load() {
    setLoading(true);
    try {
      const products = await getProducts();
      setItems(products);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const rows = useMemo(() => items || [], [items]);

  async function onCreate(e) {
    e.preventDefault();
    setSubmitting(true);

    try {
      await createProduct({
        name: createForm.name,
        stock: createForm.stock,
        price: createForm.price,
      });
      toast.success("Produk dibuat");
      setCreateForm({ name: "", stock: "0", price: "0" });
      await load();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function onSell(product) {
    const quantity = Number(sellQty[product.id] || 1);
    const confirm = await confirmDanger({
      title: "Konfirmasi Jual",
      text: `Jual ${quantity} item untuk produk: ${product.name}?`,
      confirmText: "Jual",
    });

    if (!confirm.isConfirmed) return;

    setSubmitting(true);
    try {
      await sellProduct(product.id, { quantity });
      toast.success("Transaksi berhasil");
      setSellQty((v) => ({ ...v, [product.id]: 1 }));
      await load();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">Produk</h1>
          <p className="text-sm text-zinc-600">
            CRUD produk (Admin) dan transaksi jual (Admin/Seller).
          </p>
        </div>
        <Button variant="secondary" onClick={load} disabled={loading}>
          Refresh
        </Button>
      </div>

      {isAdmin ? (
        <Card>
          <h2 className="text-sm font-semibold text-zinc-900">Tambah Produk</h2>
          <form className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-4" onSubmit={onCreate}>
            <Input
              label="Nama"
              value={createForm.name}
              onChange={(e) => setCreateForm((v) => ({ ...v, name: e.target.value }))}
              required
            />
            <Input
              label="Stock"
              type="number"
              min={0}
              value={createForm.stock}
              onChange={(e) => setCreateForm((v) => ({ ...v, stock: e.target.value }))}
              required
            />
            <Input
              label="Harga"
              type="number"
              min={0}
              value={createForm.price}
              onChange={(e) => setCreateForm((v) => ({ ...v, price: e.target.value }))}
              required
            />
            <div className="flex items-end">
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Menyimpan..." : "Simpan"}
              </Button>
            </div>
          </form>
        </Card>
      ) : null}

      <Card>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-900">Daftar Produk</h2>
          {loading ? <span className="text-sm text-zinc-500">Loading...</span> : null}
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                <th className="py-2 pr-3">Nama</th>
                <th className="py-2 pr-3">Harga</th>
                <th className="py-2 pr-3">Stock</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2 pr-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id} className="border-b border-zinc-100">
                  <td className="py-3 pr-3 font-medium text-zinc-900">{p.name}</td>
                  <td className="py-3 pr-3 text-zinc-700">Rp {p.price}</td>
                  <td className="py-3 pr-3 text-zinc-700">{p.stock}</td>
                  <td className="py-3 pr-3">{stockBadge(p.stock)}</td>
                  <td className="py-3 pr-3">
                    {allowSell ? (
                      <div className="flex items-center gap-2">
                        <input
                          className="w-20 rounded-xl border border-zinc-200 px-2 py-1 text-sm"
                          type="number"
                          min={1}
                          value={sellQty[p.id] ?? 1}
                          onChange={(e) =>
                            setSellQty((v) => ({ ...v, [p.id]: e.target.value }))
                          }
                        />
                        <Button
                          variant="danger"
                          onClick={() => onSell(p)}
                          disabled={submitting || loading}
                        >
                          Jual
                        </Button>
                      </div>
                    ) : (
                      <span className="text-sm text-zinc-500">View only</span>
                    )}
                  </td>
                </tr>
              ))}
              {!loading && rows.length === 0 ? (
                <tr>
                  <td className="py-6 text-center text-sm text-zinc-500" colSpan={5}>
                    Belum ada produk.
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
