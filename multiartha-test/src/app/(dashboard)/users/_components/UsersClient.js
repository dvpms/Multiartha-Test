"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import { confirmDanger, promptSelect } from "@/lib/alert";
import { createUser, deleteUser, getUsers, updateUser } from "@/features/users/client";
import { ROLES, ROLE_NAMES } from "@/server/domain/constants/roles";

export default function UsersClient() {
  const { data: session } = useSession();
  const role = session?.user?.role;
  const actorId = session?.user?.id;

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyById, setBusyById] = useState({});

  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    email: "",
    password: "",
    roleName: ROLES.PELANGGAN,
  });

  const [editOpen, setEditOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", password: "", roleName: "" });

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

  function openEdit(user) {
    setEditUser(user);
    setEditForm({
      name: user.name || "",
      email: user.email || "",
      password: "",
      roleName: user.role?.name || ROLES.PELANGGAN,
    });
    setEditOpen(true);
  }

  async function onCreate(e) {
    e.preventDefault();

    const name = createForm.name.trim();
    const email = createForm.email.trim();
    const password = createForm.password;
    const roleName = createForm.roleName;

    if (!name) return toast.error("Nama wajib diisi");
    if (!email) return toast.error("Email wajib diisi");
    if (!password || password.length < 6) return toast.error("Password minimal 6 karakter");
    if (!roleName) return toast.error("Role wajib dipilih");

    setBusyById((v) => ({ ...v, __create: true }));
    try {
      await createUser({ name, email, password, roleName });
      toast.success("User dibuat");
      setCreateOpen(false);
      setCreateForm({ name: "", email: "", password: "", roleName: ROLES.PELANGGAN });
      await load();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusyById((v) => {
        const next = { ...v };
        delete next.__create;
        return next;
      });
    }
  }

  async function onUpdate(e) {
    e.preventDefault();
    if (!editUser) return;

    const name = editForm.name.trim();
    const email = editForm.email.trim();
    const roleName = editForm.roleName;
    const password = editForm.password;

    if (!name) return toast.error("Nama wajib diisi");
    if (!email) return toast.error("Email wajib diisi");
    if (!roleName) return toast.error("Role wajib dipilih");
    if (password && password.length < 6) return toast.error("Password minimal 6 karakter");

    const payload = { name, email, roleName };
    if (password) payload.password = password;

    setBusyById((v) => ({ ...v, [editUser.id]: "update" }));
    try {
      await updateUser(editUser.id, payload);
      toast.success("User diperbarui");
      setEditOpen(false);
      setEditUser(null);
      await load();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusyById((v) => {
        const next = { ...v };
        if (editUser?.id) delete next[editUser.id];
        return next;
      });
    }
  }

  async function onDelete(user) {
    const confirm = await confirmDanger({
      title: "Hapus User",
      text: `Yakin hapus user: ${user.email}?`,
      confirmText: "Hapus",
    });
    if (!confirm.isConfirmed) return;

    setBusyById((v) => ({ ...v, [user.id]: "delete" }));
    try {
      await deleteUser(user.id);
      toast.success("User dihapus");
      await load();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusyById((v) => {
        const next = { ...v };
        delete next[user.id];
        return next;
      });
    }
  }

  async function onChangeRole(user) {
    const current = user.role?.name;
    const options = ROLE_NAMES.reduce((acc, name) => {
      acc[name] = name;
      return acc;
    }, {});

    const pick = await promptSelect({
      title: "Pilih role baru",
      text: `User: ${user.email}`,
      options,
      defaultValue: current,
      confirmText: "Lanjut",
    });

    if (!pick.isConfirmed) return;
    const next = pick.value;
    if (!next || next === current) return;

    const confirm = await confirmDanger({
      title: "Konfirmasi",
      text: `Ubah role user ${user.email} dari ${current} menjadi ${next}?`,
      confirmText: "Ubah",
    });

    if (!confirm.isConfirmed) return;

    setBusyById((v) => ({ ...v, [user.id]: "role" }));
    try {
      await updateUser(user.id, { roleName: next });
      toast.success("Role berhasil diubah");
      await load();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusyById((v) => {
        const updated = { ...v };
        delete updated[user.id];
        return updated;
      });
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
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={load} disabled={loading}>
            Refresh
          </Button>
          <Button onClick={() => setCreateOpen(true)} disabled={loading}>
            Tambah User
          </Button>
        </div>
      </div>

      <Card>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-900">Daftar User</h2>
          {loading ? <span className="text-sm text-zinc-500">Loading...</span> : null}
        </div>

        <div className="mt-4 max-h-[70vh] overflow-auto rounded-xl border border-zinc-100">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 z-10 bg-white/90 backdrop-blur">
              <tr className="border-b border-zinc-200 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                <th className="px-3 py-2">Email</th>
                <th className="px-3 py-2">Nama</th>
                <th className="px-3 py-2">Role</th>
                <th className="px-3 py-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((u) => {
                const isSelf = actorId && u.id === actorId;
                return (
                  <tr
                    key={u.id}
                    className="border-b border-zinc-100 odd:bg-zinc-50/50 hover:bg-zinc-50"
                  >
                    <td className="px-3 py-3 font-medium text-zinc-900">{u.email}</td>
                    <td className="px-3 py-3 text-zinc-700">{u.name}</td>
                    <td className="px-3 py-3 text-zinc-700">{u.role?.name}</td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          variant="secondary"
                          onClick={() => onChangeRole(u)}
                          disabled={loading || isSelf || !!busyById[u.id]}
                        >
                          {isSelf ? "Tidak bisa" : "Ubah Role"}
                        </Button>

                        <Button
                          variant="secondary"
                          onClick={() => openEdit(u)}
                          disabled={loading || !!busyById[u.id]}
                        >
                          Edit
                        </Button>

                        <Button
                          variant="danger"
                          onClick={() => onDelete(u)}
                          disabled={loading || isSelf || !!busyById[u.id]}
                        >
                          {isSelf
                            ? "Tidak bisa"
                            : busyById[u.id] === "delete"
                              ? "Menghapus..."
                              : "Hapus"}
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!loading && rows.length === 0 ? (
                <tr>
                  <td className="px-3 py-10 text-center text-sm text-zinc-500" colSpan={4}>
                    Belum ada user.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal title="Tambah User" open={createOpen} onClose={() => {
        if (busyById.__create) return;
        setCreateOpen(false);
      }}>
        <form className="grid grid-cols-1 gap-4" onSubmit={onCreate}>
          <Input
            label="Nama"
            value={createForm.name}
            onChange={(e) => setCreateForm((v) => ({ ...v, name: e.target.value }))}
            required
          />
          <Input
            label="Email"
            type="email"
            value={createForm.email}
            onChange={(e) => setCreateForm((v) => ({ ...v, email: e.target.value }))}
            required
          />
          <Input
            label="Password"
            type="password"
            value={createForm.password}
            onChange={(e) => setCreateForm((v) => ({ ...v, password: e.target.value }))}
            required
          />
          <label className="block">
            <div className="mb-1 text-sm font-medium text-zinc-900">Role</div>
            <select
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200"
              value={createForm.roleName}
              onChange={(e) => setCreateForm((v) => ({ ...v, roleName: e.target.value }))}
            >
              {ROLE_NAMES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </label>
          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                if (busyById.__create) return;
                setCreateOpen(false);
              }}
              disabled={!!busyById.__create}
            >
              Batal
            </Button>
            <Button type="submit" disabled={!!busyById.__create}>
              {busyById.__create ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        title={editUser ? `Edit User: ${editUser.email}` : "Edit User"}
        open={editOpen}
        onClose={() => {
          if (editUser?.id && busyById[editUser.id]) return;
          setEditOpen(false);
          setEditUser(null);
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
            label="Email"
            type="email"
            value={editForm.email}
            onChange={(e) => setEditForm((v) => ({ ...v, email: e.target.value }))}
            required
          />
          <Input
            label="Password (opsional)"
            type="password"
            placeholder="Kosongkan jika tidak diubah"
            value={editForm.password}
            onChange={(e) => setEditForm((v) => ({ ...v, password: e.target.value }))}
          />
          <label className="block">
            <div className="mb-1 text-sm font-medium text-zinc-900">Role</div>
            <select
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200"
              value={editForm.roleName}
              onChange={(e) => setEditForm((v) => ({ ...v, roleName: e.target.value }))}
              disabled={actorId && editUser?.id === actorId}
              title={actorId && editUser?.id === actorId ? "Tidak bisa mengubah role sendiri" : undefined}
            >
              {ROLE_NAMES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            {actorId && editUser?.id === actorId ? (
              <div className="mt-1 text-xs text-zinc-500">Role diri sendiri tidak bisa diubah.</div>
            ) : null}
          </label>
          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                if (editUser?.id && busyById[editUser.id]) return;
                setEditOpen(false);
                setEditUser(null);
              }}
              disabled={editUser?.id ? !!busyById[editUser.id] : false}
            >
              Batal
            </Button>
            <Button type="submit" disabled={editUser?.id ? !!busyById[editUser.id] : false}>
              {editUser?.id && busyById[editUser.id] === "update" ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
