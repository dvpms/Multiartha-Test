import { prisma } from "../../infrastructure/db/prisma";
import { auditLogRepo } from "../../infrastructure/repositories/auditLogRepo";
import { productRepo } from "../../infrastructure/repositories/productRepo";

export async function createProduct({ actorUserId, data }) {
  return prisma.$transaction(async (tx) => {
    const created = await productRepo.create(data, { tx });

    await auditLogRepo.create(
      {
        actorUserId,
        entityType: "product",
        action: "create",
        entityId: created.id,
        before: null,
        after: {
          id: created.id,
          name: created.name,
          stock: created.stock,
          price: created.price,
        },
      },
      { tx }
    );

    return created;
  });
}
