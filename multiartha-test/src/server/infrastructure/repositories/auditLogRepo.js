import { prisma } from "../db/prisma";

export const auditLogRepo = {
  async create(
    { actorUserId, entityType, action, entityId, before, after, metadata },
    { tx } = {}
  ) {
    const client = tx || prisma;
    return client.auditLog.create({
      data: {
        actorUserId,
        entityType,
        action,
        entityId,
        before,
        after,
        metadata,
      },
    });
  },

  async listLatest({ take = 200 } = {}) {
    return prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take,
      select: {
        id: true,
        entityType: true,
        action: true,
        entityId: true,
        before: true,
        after: true,
        metadata: true,
        createdAt: true,
        actor: { select: { id: true, name: true, email: true } },
      },
    });
  },
};
