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

export function restockProduct(productId, payload) {
  return apiRequest(`/api/products/${productId}/restock`, { method: "POST", body: payload });
}

export function updateProduct(productId, payload) {
  return apiRequest(`/api/products/${productId}`, { method: "PUT", body: payload });
}

export function deleteProduct(productId) {
  return apiRequest(`/api/products/${productId}`, { method: "DELETE" });
}
