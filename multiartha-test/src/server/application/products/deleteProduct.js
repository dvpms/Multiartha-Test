import { productRepo } from "../../infrastructure/repositories/productRepo";
import { ConflictError, NotFoundError } from "../../domain/errors/appErrors";

export async function deleteProduct({ productId }) {
  const existing = await productRepo.findById(productId);
  if (!existing) throw new NotFoundError("Product not found");

  const txCount = await productRepo.countTransactions(productId);
  if (txCount > 0) {
    throw new ConflictError("Cannot delete product with transactions");
  }

  await productRepo.deleteById(productId);

  return { productId };
}
