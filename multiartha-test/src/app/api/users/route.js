import { listUsers } from "@/server/application/users/listUsers";
import { createUserSchema } from "@/features/users/schemas";
import { createUser } from "@/server/application/users/createUser";
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

export async function POST(request) {
  try {
    await requireRole([ROLES.ADMIN]);
    const body = await request.json();
    const input = createUserSchema.parse(body);
    const created = await createUser(input);
    return jsonOk(created, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
