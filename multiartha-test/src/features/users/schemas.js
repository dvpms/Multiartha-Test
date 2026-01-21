import { z } from "zod";
import { ROLE_NAMES } from "../../server/domain/constants/roles";

export const changeRoleSchema = z.object({
  roleName: z.enum(ROLE_NAMES),
});

export const createUserSchema = z.object({
  name: z.string().trim().min(1),
  email: z.string().trim().email(),
  password: z.string().min(6),
  roleName: z.enum(ROLE_NAMES),
});

export const updateUserSchema = z
  .object({
    name: z.string().trim().min(1).optional(),
    email: z.string().trim().email().optional(),
    password: z.string().min(6).optional(),
    roleName: z.enum(ROLE_NAMES).optional(),
  })
  .refine(
    (v) =>
      v.name !== undefined ||
      v.email !== undefined ||
      v.password !== undefined ||
      v.roleName !== undefined,
    { message: "At least one field is required" }
  );
