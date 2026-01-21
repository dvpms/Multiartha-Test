import { changeRoleSchema } from "@/features/users/schemas";
import { changeUserRole } from "@/server/application/users/changeUserRole";
import { ROLES } from "@/server/domain/constants/roles";
import { ForbiddenError } from "@/server/domain/errors/appErrors";
import { handleRouteError } from "@/server/http/handleRouteError";
import { jsonOk } from "@/server/http/responses";
import { requireRole } from "@/server/auth/session";

export async function PUT(request, { params }) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const session = await requireRole([ROLES.ADMIN]);
    const body = await request.json();
    const input = changeRoleSchema.parse(body);

    if (session.user.id === resolvedParams.id) {
      throw new ForbiddenError("You cannot change your own role");
    }

    const result = await changeUserRole({
      targetUserId: resolvedParams.id,
      roleName: input.roleName,
    });

    return jsonOk(result);
  } catch (error) {
    return handleRouteError(error);
  }
}
