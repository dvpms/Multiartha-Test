import bcrypt from "bcryptjs";

import { prisma } from "../../infrastructure/db/prisma";
import { userRepo } from "../../infrastructure/repositories/userRepo";
import { ConflictError, NotFoundError } from "../../domain/errors/appErrors";

export async function createUser({ name, email, password, roleName }) {
  return prisma.$transaction(async (tx) => {
    const existing = await userRepo.findByEmail(email, { tx });
    if (existing) throw new ConflictError("Email already used");

    const role = await userRepo.findRoleByName(roleName, { tx });
    if (!role) throw new NotFoundError("Role not found");

    const hashed = await bcrypt.hash(password, 10);
    const created = await userRepo.create({ name, email, password: hashed, roleId: role.id }, { tx });
    return created;
  });
}
