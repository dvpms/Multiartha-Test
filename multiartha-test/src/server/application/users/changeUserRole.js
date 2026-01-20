import { userRepo } from "../../infrastructure/repositories/userRepo";
import { ForbiddenError, NotFoundError } from "../../domain/errors/appErrors";

export async function changeUserRole({ actorUserId, targetUserId, roleName }) {
  if (actorUserId === targetUserId) {
    throw new ForbiddenError("You cannot change your own role");
  }

  const targetUser = await userRepo.findByIdWithRole(targetUserId);
  if (!targetUser) throw new NotFoundError("User not found");

  const role = await userRepo.findRoleByName(roleName);
  if (!role) throw new NotFoundError("Role not found");

  await userRepo.updateRole(targetUserId, role.id);

  return { userId: targetUserId, roleName: role.name };
}
