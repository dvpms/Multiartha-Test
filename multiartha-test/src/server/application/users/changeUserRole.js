import { prisma } from "../../infrastructure/db/prisma";
import { auditLogRepo } from "../../infrastructure/repositories/auditLogRepo";
import { userRepo } from "../../infrastructure/repositories/userRepo";
import { ConflictError, ForbiddenError, NotFoundError } from "../../domain/errors/appErrors";
import { ROLES } from "../../domain/constants/roles";

export async function changeUserRole({ actorUserId, targetUserId, roleName }) {
  return prisma.$transaction(async (tx) => {
    if (actorUserId === targetUserId) {
      throw new ForbiddenError("You cannot change your own role");
    }

    const targetUser = await userRepo.findByIdWithRole(targetUserId, { tx });
    if (!targetUser) throw new NotFoundError("User not found");

    const role = await userRepo.findRoleByName(roleName, { tx });
    if (!role) throw new NotFoundError("Role not found");

    const isDemotingAdmin = targetUser.role?.name === ROLES.ADMIN && role.name !== ROLES.ADMIN;
    if (isDemotingAdmin) {
      const adminCount = await userRepo.countAdmins({ tx });
      if (adminCount <= 1) throw new ConflictError("Cannot remove last admin");
    }

    await userRepo.updateRole(targetUserId, role.id, { tx });

    await auditLogRepo.create(
      {
        actorUserId,
        entityType: "user",
        action: "role_change",
        entityId: targetUserId,
        before: {
          id: targetUser.id,
          roleName: targetUser.role?.name,
        },
        after: {
          id: targetUser.id,
          roleName: role.name,
        },
      },
      { tx }
    );

    return { userId: targetUserId, roleName: role.name };
  });
}
