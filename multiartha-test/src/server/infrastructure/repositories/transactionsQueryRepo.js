import { prisma } from "../db/prisma";

export const transactionsQueryRepo = {
  async listLatest() {
    return prisma.transaction.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      select: {
        id: true,
        quantity: true,
        totalPrice: true,
        createdAt: true,
        user: { select: { id: true, name: true, email: true } },
        product: { select: { id: true, name: true, price: true } },
      },
    });
  },
};
