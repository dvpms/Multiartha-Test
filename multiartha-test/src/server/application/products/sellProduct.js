import { prisma } from "../../infrastructure/db/prisma";
import { auditLogRepo } from "../../infrastructure/repositories/auditLogRepo";
import { productRepo } from "../../infrastructure/repositories/productRepo";
import { transactionRepo } from "../../infrastructure/repositories/transactionRepo";
import { ConflictError, NotFoundError } from "../../domain/errors/appErrors";

export async function sellProduct({ productId, userId, quantity }) {
  return prisma.$transaction(async (tx) => {
    const product = await productRepo.findById(productId, { tx });
    if (!product) throw new NotFoundError("Product not found");

    const updateResult = await productRepo.decrementStockIfEnough(productId, quantity, { tx });
    if (updateResult.count !== 1) {
      throw new ConflictError("Insufficient stock");
    }

    const totalPrice = product.price * quantity;

    const txRecord = await transactionRepo.create(
      { userId, productId, quantity, totalPrice },
      { tx }
    );

    await auditLogRepo.create(
      {
        actorUserId: userId,
        entityType: "sale",
        action: "create",
        entityId: txRecord.id,
        before: null,
        after: {
          id: txRecord.id,
          productId,
          quantity,
          totalPrice,
        },
        metadata: {
          product: { id: product.id, name: product.name },
          stockBefore: product.stock,
          stockAfter: product.stock - quantity,
        },
      },
      { tx }
    );

    return {
      productId,
      quantity,
      totalPrice,
    };
  });
}
