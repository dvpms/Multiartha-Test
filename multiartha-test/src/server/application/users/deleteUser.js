import { prisma } from "../../infrastructure/db/prisma";
import { userRepo } from "../../infrastructure/repositories/userRepo";
import { ConflictError, NotFoundError } from "../../domain/errors/appErrors";
import { ROLES } from "../../domain/constants/roles";

export async function deleteUser({ targetUserId }) {
  return prisma.$transaction(async (tx) => {
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
    return { userId: targetUserId };
  });
}
