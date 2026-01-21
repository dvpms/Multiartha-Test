import { productRepo } from "../../infrastructure/repositories/productRepo";
import { NotFoundError } from "../../domain/errors/appErrors";

export async function restockProduct({ productId, quantity }) {
  const existing = await productRepo.findById(productId);
  if (!existing) throw new NotFoundError("Product not found");
  return productRepo.incrementStockById(productId, quantity);
}