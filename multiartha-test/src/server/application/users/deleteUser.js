import { prisma } from "../../infrastructure/db/prisma";
import { auditLogRepo } from "../../infrastructure/repositories/auditLogRepo";
import { userRepo } from "../../infrastructure/repositories/userRepo";
import { ConflictError, ForbiddenError, NotFoundError } from "../../domain/errors/appErrors";
import { ROLES } from "../../domain/constants/roles";

export async function deleteUser({ actorUserId, targetUserId }) {
  return prisma.$transaction(async (tx) => {
    if (actorUserId === targetUserId) {
      throw new ForbiddenError("You cannot delete your own user");
    }

    const target = await userRepo.findByIdWithRole(targetUserId, { tx });
    if (!target) throw new NotFoundError("User not found");

    if (target.role?.name === ROLES.ADMIN) {
      const adminCount = await userRepo.countAdmins({ tx });
      if (adminCount <= 1) throw new ConflictError("Cannot delete last admin");
    }

    const txCount = await userRepo.countTransactions(targetUserId, { tx });
    if (txCount > 0) {
      throw new ConflictError("Cannot delete user with transactions");
    }

    await userRepo.deleteById(targetUserId, { tx });

    await auditLogRepo.create(
      {
        actorUserId,
        entityType: "user",
        action: "delete",
        entityId: targetUserId,
        before: {
          id: target.id,
          name: target.name,
          email: target.email,
          roleName: target.role?.name,
        },
        after: null,
      },
      { tx }
    );

    return { userId: targetUserId };
  });
}
