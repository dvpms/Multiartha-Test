const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const ROLES = {
  ADMIN: "Admin",
  SELLER: "Seller",
  PELANGGAN: "Pelanggan",
};

const prisma = new PrismaClient();

async function upsertRoles() {
  const roleRecords = await Promise.all(
    Object.values(ROLES).map((name) =>
      prisma.role.upsert({
        where: { name },
        update: {},
        create: { name },
      })
    )
  );

  return Object.fromEntries(roleRecords.map((r) => [r.name, r]));
}

async function upsertUser({ name, email, password, roleId }) {
  const passwordHash = await bcrypt.hash(password, 12);
  return prisma.user.upsert({
    where: { email },
    update: {
      name,
      password: passwordHash,
      roleId,
    },
    create: {
      name,
      email,
      password: passwordHash,
      roleId,
    },
  });
}

async function ensureProducts() {
  const count = await prisma.product.count();
  if (count > 0) return;

  await prisma.product.createMany({
    data: [
      { name: "Pulpen", stock: 100, price: 5000 },
      { name: "Buku Tulis", stock: 50, price: 12000 },
      { name: "Spidol", stock: 25, price: 15000 },
      { name: "Penghapus", stock: 10, price: 3000 },
      { name: "Pensil", stock: 0, price: 4000 },
    ],
  });
}

async function main() {
  const roles = await upsertRoles();

  await upsertUser({
    name: "Admin",
    email: "admin@local.test",
    password: "Admin123!",
    roleId: roles[ROLES.ADMIN].id,
  });

  await upsertUser({
    name: "Seller",
    email: "seller@local.test",
    password: "Seller123!",
    roleId: roles[ROLES.SELLER].id,
  });

  await upsertUser({
    name: "Pelanggan",
    email: "pelanggan@local.test",
    password: "Pelanggan123!",
    roleId: roles[ROLES.PELANGGAN].id,
  });

  await ensureProducts();

  console.log("[seed] Done.");
  console.log("[seed] Default accounts:");
  console.log("  - admin@local.test / Admin123!");
  console.log("  - seller@local.test / Seller123!");
  console.log("  - pelanggan@local.test / Pelanggan123!");
}

main()
  .catch((e) => {
    console.error("[seed] Failed:", e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
