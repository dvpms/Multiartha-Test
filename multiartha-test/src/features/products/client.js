import { apiRequest } from "@/lib/apiClient";

export function getProducts() {
  return apiRequest("/api/products");
}

export function createProduct(payload) {
  return apiRequest("/api/products", { method: "POST", body: payload });
}

export function sellProduct(productId, payload) {
  return apiRequest(`/api/products/${productId}/sell`, { method: "POST", body: payload });
}
