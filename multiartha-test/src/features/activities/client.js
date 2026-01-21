import { apiRequest } from "@/lib/apiClient";

export function getActivities() {
  return apiRequest("/api/activities");
}
