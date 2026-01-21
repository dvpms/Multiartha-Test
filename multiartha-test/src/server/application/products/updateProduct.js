import { productRepo } from "../../infrastructure/repositories/productRepo";
import { NotFoundError } from "../../domain/errors/appErrors";

export async function updateProduct({ productId, data }) {
  const existing = await productRepo.findById(productId);
  if (!existing) throw new NotFoundError("Product not found");
  return productRepo.updateById(productId, data);
}
