import { apiRequest } from "@/lib/apiClient";

export function getTransactions() {
  return apiRequest("/api/transactions");
}
