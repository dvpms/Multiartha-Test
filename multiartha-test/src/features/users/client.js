import { apiRequest } from "@/lib/apiClient";

export function getUsers() {
  return apiRequest("/api/users");
}

export function createUser(payload) {
  return apiRequest("/api/users", { method: "POST", body: payload });
}

export function updateUser(userId, payload) {
  return apiRequest(`/api/users/${userId}`, { method: "PUT", body: payload });
}

export function deleteUser(userId) {
  return apiRequest(`/api/users/${userId}`, { method: "DELETE" });
}

export function changeUserRole(userId, roleName) {
  return apiRequest(`/api/users/${userId}/change-role`, {
    method: "PUT",
    body: { roleName },
  });
}
