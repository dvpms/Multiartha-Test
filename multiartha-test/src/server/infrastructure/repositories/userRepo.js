import { prisma } from "../db/prisma";
import { ROLES } from "../../domain/constants/roles";

export const userRepo = {
  async listWithRole() {
    return prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
        role: { select: { name: true, id: true } },
      },
    });
  },

  async findByIdWithRole(id, { tx } = {}) {
    const client = tx || prisma;
    return client.user.findUnique({ where: { id }, include: { role: true } });
  },

  async findByEmail(email, { tx } = {}) {
    const client = tx || prisma;
    return client.user.findUnique({ where: { email } });
  },

  async findRoleByName(name, { tx } = {}) {
    const client = tx || prisma;
    return client.role.findUnique({ where: { name } });
  },

  async updateRole(userId, roleId, { tx } = {}) {
    const client = tx || prisma;
    return client.user.update({ where: { id: userId }, data: { roleId } });
  },

  async create({ name, email, password, roleId }, { tx } = {}) {
    const client = tx || prisma;
    return client.user.create({
      data: { name, email, password, roleId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
        role: { select: { name: true, id: true } },
      },
    });
  },

  async updateById(userId, data, { tx } = {}) {
    const client = tx || prisma;
    return client.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
        role: { select: { name: true, id: true } },
      },
    });
  },

  async deleteById(userId, { tx } = {}) {
    const client = tx || prisma;
    return client.user.delete({ where: { id: userId } });
  },

  async countTransactions(userId, { tx } = {}) {
    const client = tx || prisma;
    return client.transaction.count({ where: { userId } });
  },

  async countAdmins({ tx } = {}) {
    const client = tx || prisma;
    return client.user.count({ where: { role: { name: ROLES.ADMIN } } });
  },
};
