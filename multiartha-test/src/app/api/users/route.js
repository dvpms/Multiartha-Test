import { listUsers } from "@/server/application/users/listUsers";
import { ROLES } from "@/server/domain/constants/roles";
import { handleRouteError } from "@/server/http/handleRouteError";
import { jsonOk } from "@/server/http/responses";
import { requireRole } from "@/server/auth/session";

export async function GET() {
  try {
    await requireRole([ROLES.ADMIN]);
    const users = await listUsers();
    return jsonOk(users);
  } catch (error) {
    return handleRouteError(error);
  }
}
