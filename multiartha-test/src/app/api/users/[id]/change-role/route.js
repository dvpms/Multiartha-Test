import { changeRoleSchema } from "@/features/users/schemas";
import { changeUserRole } from "@/server/application/users/changeUserRole";
import { ROLES } from "@/server/domain/constants/roles";
import { handleRouteError } from "@/server/http/handleRouteError";
import { jsonOk } from "@/server/http/responses";
import { requireRole } from "@/server/auth/session";

export async function PUT(request, { params }) {
  try {
    const session = await requireRole([ROLES.ADMIN]);
    const body = await request.json();
    const input = changeRoleSchema.parse(body);

    const result = await changeUserRole({
      actorUserId: session.user.id,
      targetUserId: params.id,
      roleName: input.roleName,
    });

    return jsonOk(result);
  } catch (error) {
    return handleRouteError(error);
  }
}
