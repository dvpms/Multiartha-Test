import { prisma } from "../db/prisma";

export const productRepo = {
  async list() {
    return prisma.product.findMany({ orderBy: { createdAt: "desc" } });
  },

  async create({ name, stock, price }) {
    return prisma.product.create({
      data: { name, stock, price },
    });
  },

  async findById(id, { tx } = {}) {
    const client = tx || prisma;
    return client.product.findUnique({ where: { id } });
  },

  async decrementStockIfEnough(id, quantity, { tx } = {}) {
    const client = tx || prisma;
    return client.product.updateMany({
      where: {
        id,
        stock: { gte: quantity },
      },
      data: {
        stock: { decrement: quantity },
      },
    });
  },
};
