import { prisma } from "../db/prisma";

export const transactionRepo = {
  async create({ userId, productId, quantity, totalPrice }, { tx } = {}) {
    const client = tx || prisma;
    return client.transaction.create({
      data: {
        userId,
        productId,
        quantity,
        totalPrice,
      },
    });
  },
};
