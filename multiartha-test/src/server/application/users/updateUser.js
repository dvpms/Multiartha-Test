import bcrypt from "bcryptjs";

import { userRepo } from "../../infrastructure/repositories/userRepo";
import { ConflictError, ForbiddenError, NotFoundError } from "../../domain/errors/appErrors";
import { ROLES } from "../../domain/constants/roles";

export async function updateUser({ actorUserId, targetUserId, data }) {
  const target = await userRepo.findByIdWithRole(targetUserId);
  if (!target) throw new NotFoundError("User not found");

  if (data.roleName && actorUserId === targetUserId) {
    throw new ForbiddenError("You cannot change your own role");
  }

  if (data.email && data.email !== target.email) {
    const existing = await userRepo.findByEmail(data.email);
    if (existing && existing.id !== targetUserId) throw new ConflictError("Email already used");
  }

  const updateData = {};

  if (data.name !== undefined) updateData.name = data.name;
  if (data.email !== undefined) updateData.email = data.email;

  if (data.password !== undefined) {
    updateData.password = await bcrypt.hash(data.password, 10);
  }

  if (data.roleName !== undefined) {
    const role = await userRepo.findRoleByName(data.roleName);
    if (!role) throw new NotFoundError("Role not found");

    const isDemotingAdmin = target.role?.name === ROLES.ADMIN && data.roleName !== ROLES.ADMIN;
    if (isDemotingAdmin) {
      const adminCount = await userRepo.countAdmins();
      if (adminCount <= 1) throw new ConflictError("Cannot remove last admin");
    }

    updateData.roleId = role.id;
  }

  return userRepo.updateById(targetUserId, updateData);
}
