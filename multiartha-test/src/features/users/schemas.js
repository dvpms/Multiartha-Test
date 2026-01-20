import { z } from "zod";
import { ROLE_NAMES } from "../../server/domain/constants/roles";

export const changeRoleSchema = z.object({
  roleName: z.enum(ROLE_NAMES),
});
