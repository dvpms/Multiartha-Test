import { prisma } from "../../infrastructure/db/prisma";
import { userRepo } from "../../infrastructure/repositories/userRepo";
import { ConflictError, NotFoundError } from "../../domain/errors/appErrors";
import { ROLES } from "../../domain/constants/roles";

export async function changeUserRole({ targetUserId, roleName }) {
  return prisma.$transaction(async (tx) => {
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
    return { userId: targetUserId, roleName: role.name };
  });
}
