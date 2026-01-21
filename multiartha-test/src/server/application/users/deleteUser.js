import { userRepo } from "../../infrastructure/repositories/userRepo";
import { ConflictError, ForbiddenError, NotFoundError } from "../../domain/errors/appErrors";
import { ROLES } from "../../domain/constants/roles";

export async function deleteUser({ actorUserId, targetUserId }) {
  if (actorUserId === targetUserId) {
    throw new ForbiddenError("You cannot delete your own user");
  }

  const target = await userRepo.findByIdWithRole(targetUserId);
  if (!target) throw new NotFoundError("User not found");

  if (target.role?.name === ROLES.ADMIN) {
    const adminCount = await userRepo.countAdmins();
    if (adminCount <= 1) throw new ConflictError("Cannot delete last admin");
  }

  const txCount = await userRepo.countTransactions(targetUserId);
  if (txCount > 0) {
    throw new ConflictError("Cannot delete user with transactions");
  }

  await userRepo.deleteById(targetUserId);
  return { userId: targetUserId };
}
