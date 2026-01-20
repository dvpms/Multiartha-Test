import { prisma } from "../db/prisma";

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

  async findRoleByName(name, { tx } = {}) {
    const client = tx || prisma;
    return client.role.findUnique({ where: { name } });
  },

  async updateRole(userId, roleId, { tx } = {}) {
    const client = tx || prisma;
    return client.user.update({ where: { id: userId }, data: { roleId } });
  },
};
