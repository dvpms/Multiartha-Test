import bcrypt from "bcryptjs";

import { prisma } from "../../infrastructure/db/prisma";
import { auditLogRepo } from "../../infrastructure/repositories/auditLogRepo";
import { userRepo } from "../../infrastructure/repositories/userRepo";
import { ConflictError, ForbiddenError, NotFoundError } from "../../domain/errors/appErrors";
import { ROLES } from "../../domain/constants/roles";

export async function updateUser({ actorUserId, targetUserId, data }) {
  return prisma.$transaction(async (tx) => {
    const target = await userRepo.findByIdWithRole(targetUserId, { tx });
    if (!target) throw new NotFoundError("User not found");

    if (data.roleName && actorUserId === targetUserId) {
      throw new ForbiddenError("You cannot change your own role");
    }

    if (data.email && data.email !== target.email) {
      const existing = await userRepo.findByEmail(data.email, { tx });
      if (existing && existing.id !== targetUserId) throw new ConflictError("Email already used");
    }

    const updateData = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.email !== undefined) updateData.email = data.email;

    const changedFields = [];
    if (data.name !== undefined && data.name !== target.name) changedFields.push("name");
    if (data.email !== undefined && data.email !== target.email) changedFields.push("email");
    if (data.password !== undefined) changedFields.push("password");

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

      if (data.roleName !== target.role?.name) changedFields.push("role");
      updateData.roleId = role.id;
    }

    const updated = await userRepo.updateById(targetUserId, updateData, { tx });

    await auditLogRepo.create(
      {
        actorUserId,
        entityType: "user",
        action: "update",
        entityId: targetUserId,
        before: {
          id: target.id,
          name: target.name,
          email: target.email,
          roleName: target.role?.name,
        },
        after: {
          id: updated.id,
          name: updated.name,
          email: updated.email,
          roleName: updated.role?.name,
        },
        metadata: {
          changedFields,
        },
      },
      { tx }
    );

    return updated;
  });
}
