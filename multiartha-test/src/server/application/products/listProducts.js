import { productRepo } from "../../infrastructure/repositories/productRepo";

export async function listProducts() {
  return productRepo.list();
}
