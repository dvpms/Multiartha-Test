import { productRepo } from "../../infrastructure/repositories/productRepo";

export async function createProduct({ data }) {
  return productRepo.create(data);
}
