import bcrypt from "bcryptjs";

import { prisma } from "../../infrastructure/db/prisma";
import { userRepo } from "../../infrastructure/repositories/userRepo";
import { ConflictError, NotFoundError } from "../../domain/errors/appErrors";
import { ROLES } from "../../domain/constants/roles";

export async function updateUser({ targetUserId, data }) {
  return prisma.$transaction(async (tx) => {
    const target = await userRepo.findByIdWithRole(targetUserId, { tx });
    if (!target) throw new NotFoundError("User not found");

    if (data.email && data.email !== target.email) {
      const existing = await userRepo.findByEmail(data.email, { tx });
      if (existing && existing.id !== targetUserId) throw new ConflictError("Email already used");
    }

    const updateData = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.email !== undefined) updateData.email = data.email;

    if (data.password !== undefined) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    if (data.roleName !== undefined) {
      const role = await userRepo.findRoleByName(data.roleName, { tx });
      if (!role) throw new NotFoundError("Role not found");

      const isDemotingAdmin = target.role?.name === ROLES.ADMIN && data.roleName !== ROLES.ADMIN;
      if (isDemotingAdmin) {
        const adminCount = await userRepo.countAdmins({ tx });
        if (adminCount <= 1) throw new ConflictError("Cannot remove last admin");
      }

      updateData.roleId = role.id;
    }

    const updated = await userRepo.updateById(targetUserId, updateData, { tx });

    return updated;
  });
}
