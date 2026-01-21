import { prisma } from "../../infrastructure/db/prisma";
import { auditLogRepo } from "../../infrastructure/repositories/auditLogRepo";
import { productRepo } from "../../infrastructure/repositories/productRepo";
import { NotFoundError } from "../../domain/errors/appErrors";

export async function updateProduct({ actorUserId, productId, data }) {
  return prisma.$transaction(async (tx) => {
    const existing = await productRepo.findById(productId, { tx });
    if (!existing) throw new NotFoundError("Product not found");

    const updated = await productRepo.updateById(productId, data, { tx });

    await auditLogRepo.create(
      {
        actorUserId,
        entityType: "product",
        action: "update",
        entityId: productId,
        before: {
          id: existing.id,
          name: existing.name,
          stock: existing.stock,
          price: existing.price,
        },
        after: {
          id: updated.id,
          name: updated.name,
          stock: updated.stock,
          price: updated.price,
        },
      },
      { tx }
    );

    return updated;
  });
}
