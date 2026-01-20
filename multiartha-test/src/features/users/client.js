import { apiRequest } from "@/lib/apiClient";

export function getUsers() {
  return apiRequest("/api/users");
}

export function changeUserRole(userId, roleName) {
  return apiRequest(`/api/users/${userId}/change-role`, {
    method: "PUT",
    body: { roleName },
  });
}
