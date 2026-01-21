# Sistem Inventaris & Manajemen User

Next.js (App Router) + Prisma + PostgreSQL + NextAuth + Zod.

## Prerequisites

- Node.js LTS
- PostgreSQL local

## Instalasi

1. Install dependencies:
	- `npm install`
2. Copy env:
	- Copy `.env.example` → `.env`
3. Isi minimal env vars:
	- `DATABASE_URL`
	- `NEXTAUTH_SECRET`

## Setup Database (PostgreSQL Lokal)

### 1) Buat database

Contoh via `psql`:

```sql
CREATE DATABASE multiartha_inventory;
```

### 2) Atur DATABASE_URL

Edit `.env` dan isi contoh berikut:

```dotenv
DATABASE_URL="postgresql://postgres:password@localhost:5432/multiartha_inventory?schema=public"
NEXTAUTH_SECRET="<isi_secret>"
NEXTAUTH_URL="http://localhost:3000"
```

Catatan:
- Jika password mengandung karakter spesial (mis. `@`, `:`, `/`), URL-encode password tersebut.
- Pastikan port/username/password sesuai instalasi PostgreSQL kamu.

### 3) Migrasi + seed

Jalankan:

- `npm run prisma:generate`
- `npm run prisma:migrate`
- `npm run db:seed`

## Environment Variables

1. Copy `.env.example` → `.env`
2. Isi minimal:
	- `DATABASE_URL`
	- `NEXTAUTH_SECRET`

## Prisma

- Generate client: `npm run prisma:generate`
- Create & apply migration (dev): `npm run prisma:migrate`
- Prisma Studio: `npm run prisma:studio`

## Akun Default (Setelah Seed)

`npm run db:seed` akan membuat role dan akun default berikut:

- Admin: `admin@local.test` / `Admin123!`
- Seller: `seller@local.test` / `Seller123!`
- Pelanggan: `pelanggan@local.test` / `Pelanggan123!`

## Fitur Selesai

- Auth (Credentials) dengan NextAuth (JWT session)
- RBAC:
	- Admin: kelola produk + user management + akses penuh halaman administrasi
	- Seller: melakukan penjualan
	- Pelanggan: akses view-only
- Produk:
	- List produk
	- CRUD produk (Admin)
	- Tambah stok (Admin)
- Penjualan:
	- Jual produk (hanya Seller)
	- Pencatatan penjualan (transactions) dan halaman Penjualan
- User Management (Admin):
	- Tambah/Edit/Hapus user, ubah role
	- Proteksi: tidak bisa delete diri sendiri, tidak bisa ubah role diri sendiri
	- Proteksi: tidak bisa menghapus admin terakhir
	- Proteksi: tidak bisa menghapus user yang sudah punya transaksi
- Validasi payload pakai Zod + error response yang konsisten
- UI feedback: react-hot-toast + konfirmasi SweetAlert2

## Development

Run: `npm run dev`
Open: http://localhost:3000
