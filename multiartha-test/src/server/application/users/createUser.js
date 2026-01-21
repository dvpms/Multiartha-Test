import bcrypt from "bcryptjs";

import { userRepo } from "../../infrastructure/repositories/userRepo";
import { ConflictError, NotFoundError } from "../../domain/errors/appErrors";

export async function createUser({ name, email, password, roleName }) {
  const existing = await userRepo.findByEmail(email);
  if (existing) throw new ConflictError("Email already used");

  const role = await userRepo.findRoleByName(roleName);
  if (!role) throw new NotFoundError("Role not found");

  const hashed = await bcrypt.hash(password, 10);

  return userRepo.create({ name, email, password: hashed, roleId: role.id });
}
