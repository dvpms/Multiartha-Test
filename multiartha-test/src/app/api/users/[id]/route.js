import { updateUserSchema } from "@/features/users/schemas";
import { deleteUser } from "@/server/application/users/deleteUser";
import { updateUser } from "@/server/application/users/updateUser";
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
    const input = updateUserSchema.parse(body);

    if (session.user.id === resolvedParams.id && input.roleName) {
      throw new ForbiddenError("You cannot change your own role");
    }

    const updated = await updateUser({
      targetUserId: resolvedParams.id,
      data: input,
    });

    return jsonOk(updated);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(_request, { params }) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const session = await requireRole([ROLES.ADMIN]);

    if (session.user.id === resolvedParams.id) {
      throw new ForbiddenError("You cannot delete your own user");
    }

    const result = await deleteUser({
      targetUserId: resolvedParams.id,
    });

    return jsonOk(result);
  } catch (error) {
    return handleRouteError(error);
  }
}
