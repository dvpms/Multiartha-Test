# Sistem Inventaris & Manajemen User

Next.js (App Router) + Prisma + PostgreSQL + NextAuth + Zod.

## Prerequisites

- Node.js LTS
- PostgreSQL local

## Environment Variables

1. Copy `.env.example` → `.env`
2. Isi minimal:
	- `DATABASE_URL`
	- `NEXTAUTH_SECRET`

## Prisma

- Generate client: `npm run prisma:generate`
- Create & apply migration (dev): `npm run prisma:migrate`
- Prisma Studio: `npm run prisma:studio`

> Seeding akan diimplementasikan pada Phase 2. Saat ini `npm run db:seed` hanya placeholder.

## Development

Run: `npm run dev`
Open: http://localhost:3000
