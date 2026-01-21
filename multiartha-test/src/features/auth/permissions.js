import { ROLES } from "@/server/domain/constants/roles";

export function canManageUsers(role) {
  return role === ROLES.ADMIN;
}

export function canViewSales(role) {
  return role === ROLES.ADMIN || role === ROLES.SELLER;
}

export function canPerformSale(role) {
  return role === ROLES.SELLER;
}
