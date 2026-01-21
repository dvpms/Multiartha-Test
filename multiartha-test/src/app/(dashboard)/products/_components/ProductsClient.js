"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import { confirmDanger } from "@/lib/alert";
import { formatRupiah } from "@/lib/format";
import {
  createProduct,
  deleteProduct,
  getProducts,
  sellProduct,
  updateProduct,
} from "@/features/products/client";
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
  const [busyById, setBusyById] = useState({});

  const [editOpen, setEditOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", stock: "0", price: "0" });

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
      const name = createForm.name.trim();
      const stock = Number(createForm.stock);
      const price = Number(createForm.price);

      if (!name) {
        toast.error("Nama produk wajib diisi");
        return;
      }
      if (!Number.isFinite(stock) || stock < 0) {
        toast.error("Stock harus angka >= 0");
        return;
      }
      if (!Number.isFinite(price) || price < 0) {
        toast.error("Harga harus angka >= 0");
        return;
      }

      await createProduct({
        name,
        stock,
        price,
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
    if (!Number.isFinite(quantity) || quantity < 1) {
      toast.error("Qty harus angka >= 1");
      return;
    }

    if (product.stock === 0) {
      toast.error("Stock habis");
      return;
    }
    if (quantity > product.stock) {
      toast.error("Qty melebihi stock tersedia");
      return;
    }

    const total = Number(product.price || 0) * quantity;
    const confirm = await confirmDanger({
      title: "Konfirmasi Jual",
      text: `Jual ${quantity} item untuk produk: ${product.name}? Total: ${formatRupiah(total)}`,
      confirmText: "Jual",
    });

    if (!confirm.isConfirmed) return;

    setBusyById((v) => ({ ...v, [product.id]: "sell" }));
    try {
      await sellProduct(product.id, { quantity });
      toast.success("Transaksi berhasil");
      setSellQty((v) => ({ ...v, [product.id]: 1 }));
      await load();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusyById((v) => {
        const next = { ...v };
        delete next[product.id];
        return next;
      });
    }
  }

  function openEdit(product) {
    setEditProduct(product);
    setEditForm({
      name: product.name || "",
      stock: String(product.stock ?? 0),
      price: String(product.price ?? 0),
    });
    setEditOpen(true);
  }

  async function onUpdate(e) {
    e.preventDefault();
    if (!editProduct) return;

    const name = editForm.name.trim();
    const stock = Math.max(0, Math.trunc(Number(editForm.stock)));
    const price = Math.max(0, Math.trunc(Number(editForm.price)));

    if (!name) {
      toast.error("Nama produk wajib diisi");
      return;
    }
    if (!Number.isFinite(stock) || stock < 0) {
      toast.error("Stock harus angka >= 0");
      return;
    }
    if (!Number.isFinite(price) || price < 0) {
      toast.error("Harga harus angka >= 0");
      return;
    }

    setBusyById((v) => ({ ...v, [editProduct.id]: "update" }));
    try {
      await updateProduct(editProduct.id, { name, stock, price });
      toast.success("Produk diperbarui");
      setEditOpen(false);
      setEditProduct(null);
      await load();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusyById((v) => {
        const next = { ...v };
        if (editProduct?.id) delete next[editProduct.id];
        return next;
      });
    }
  }

  async function onDelete(product) {
    const confirm = await confirmDanger({
      title: "Hapus Produk",
      text: `Yakin hapus produk: ${product.name}?`,
      confirmText: "Hapus",
    });

    if (!confirm.isConfirmed) return;

    setBusyById((v) => ({ ...v, [product.id]: "delete" }));
    try {
      await deleteProduct(product.id);
      toast.success("Produk dihapus");
      await load();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusyById((v) => {
        const next = { ...v };
        delete next[product.id];
        return next;
      });
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
              step={1}
              inputMode="numeric"
              value={createForm.stock}
              onChange={(e) => setCreateForm((v) => ({ ...v, stock: e.target.value }))}
              onBlur={(e) => {
                const v = Math.max(0, Math.trunc(Number(e.target.value || 0)));
                setCreateForm((curr) => ({ ...curr, stock: String(Number.isFinite(v) ? v : 0) }));
              }}
              required
            />
            <Input
              label="Harga"
              type="number"
              min={0}
              step={1}
              inputMode="numeric"
              value={createForm.price}
              onChange={(e) => setCreateForm((v) => ({ ...v, price: e.target.value }))}
              onBlur={(e) => {
                const v = Math.max(0, Math.trunc(Number(e.target.value || 0)));
                setCreateForm((curr) => ({ ...curr, price: String(Number.isFinite(v) ? v : 0) }));
              }}
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

        <div className="mt-4 max-h-[70vh] overflow-auto rounded-xl border border-zinc-100">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 z-10 bg-white/90 backdrop-blur">
              <tr className="border-b border-zinc-200 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                <th className="px-3 py-2">Nama</th>
                <th className="px-3 py-2 text-right">Harga</th>
                <th className="px-3 py-2 text-right">Stock</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-zinc-100 odd:bg-zinc-50/50 hover:bg-zinc-50"
                >
                  <td className="px-3 py-3 font-medium text-zinc-900">{p.name}</td>
                  <td className="px-3 py-3 text-right tabular-nums text-zinc-700">
                    {formatRupiah(p.price)}
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums text-zinc-700">{p.stock}</td>
                  <td className="px-3 py-3">{stockBadge(p.stock)}</td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      {allowSell ? (
                        <div className="flex items-center gap-2 whitespace-nowrap">
                          <input
                            className="w-20 rounded-xl border border-zinc-200 px-2 py-1 text-sm"
                            type="number"
                            min={1}
                            step={1}
                            inputMode="numeric"
                            value={sellQty[p.id] ?? 1}
                            onChange={(e) =>
                              setSellQty((v) => ({ ...v, [p.id]: e.target.value }))
                            }
                            onBlur={(e) => {
                              const v = Number(e.target.value || 1);
                              setSellQty((curr) => ({
                                ...curr,
                                [p.id]: Number.isFinite(v) && v >= 1 ? v : 1,
                              }));
                            }}
                          />
                          <Button
                            variant="danger"
                            onClick={() => onSell(p)}
                            disabled={loading || !!busyById[p.id]}
                          >
                            {busyById[p.id] === "sell" ? "Menjual..." : "Jual"}
                          </Button>
                        </div>
                      ) : (
                        <span className="text-sm text-zinc-500">View only</span>
                      )}

                      {isAdmin ? (
                        <>
                          <Button
                            variant="secondary"
                            onClick={() => openEdit(p)}
                            disabled={loading || !!busyById[p.id]}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="danger"
                            onClick={() => onDelete(p)}
                            disabled={loading || !!busyById[p.id]}
                          >
                            {busyById[p.id] === "delete" ? "Menghapus..." : "Hapus"}
                          </Button>
                        </>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && rows.length === 0 ? (
                <tr>
                  <td className="px-3 py-10 text-center text-sm text-zinc-500" colSpan={5}>
                    Belum ada produk.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        title={editProduct ? `Edit Produk: ${editProduct.name}` : "Edit Produk"}
        open={editOpen}
        onClose={() => {
          if (editProduct?.id && busyById[editProduct.id]) return;
          setEditOpen(false);
          setEditProduct(null);
        }}
      >
        <form className="grid grid-cols-1 gap-4" onSubmit={onUpdate}>
          <Input
            label="Nama"
            value={editForm.name}
            onChange={(e) => setEditForm((v) => ({ ...v, name: e.target.value }))}
            required
          />
          <Input
            label="Stock"
            type="number"
            min={0}
            step={1}
            inputMode="numeric"
            value={editForm.stock}
            onChange={(e) => setEditForm((v) => ({ ...v, stock: e.target.value }))}
            onBlur={(e) => {
              const v = Math.max(0, Math.trunc(Number(e.target.value || 0)));
              setEditForm((curr) => ({ ...curr, stock: String(Number.isFinite(v) ? v : 0) }));
            }}
            required
          />
          <Input
            label="Harga"
            type="number"
            min={0}
            step={1}
            inputMode="numeric"
            value={editForm.price}
            onChange={(e) => setEditForm((v) => ({ ...v, price: e.target.value }))}
            onBlur={(e) => {
              const v = Math.max(0, Math.trunc(Number(e.target.value || 0)));
              setEditForm((curr) => ({ ...curr, price: String(Number.isFinite(v) ? v : 0) }));
            }}
            required
          />
          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                if (editProduct?.id && busyById[editProduct.id]) return;
                setEditOpen(false);
                setEditProduct(null);
              }}
              disabled={editProduct?.id ? !!busyById[editProduct.id] : false}
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={editProduct?.id ? !!busyById[editProduct.id] : false}
            >
              {editProduct?.id && busyById[editProduct.id] === "update"
                ? "Menyimpan..."
                : "Simpan"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
