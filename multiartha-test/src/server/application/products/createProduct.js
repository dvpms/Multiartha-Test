import { productRepo } from "../../infrastructure/repositories/productRepo";

export async function createProduct(input) {
  return productRepo.create(input);
}
