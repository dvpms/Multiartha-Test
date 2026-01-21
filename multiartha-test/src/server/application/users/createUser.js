import bcrypt from "bcryptjs";

import { prisma } from "../../infrastructure/db/prisma";
import { auditLogRepo } from "../../infrastructure/repositories/auditLogRepo";
import { userRepo } from "../../infrastructure/repositories/userRepo";
import { ConflictError, NotFoundError } from "../../domain/errors/appErrors";

export async function createUser({ actorUserId, name, email, password, roleName }) {
  return prisma.$transaction(async (tx) => {
    const existing = await userRepo.findByEmail(email, { tx });
    if (existing) throw new ConflictError("Email already used");

    const role = await userRepo.findRoleByName(roleName, { tx });
    if (!role) throw new NotFoundError("Role not found");

    const hashed = await bcrypt.hash(password, 10);
    const created = await userRepo.create({ name, email, password: hashed, roleId: role.id }, { tx });

    await auditLogRepo.create(
      {
        actorUserId,
        entityType: "user",
        action: "create",
        entityId: created.id,
        before: null,
        after: {
          id: created.id,
          name: created.name,
          email: created.email,
          roleName: created.role?.name,
        },
      },
      { tx }
    );

    return created;
  });
}
