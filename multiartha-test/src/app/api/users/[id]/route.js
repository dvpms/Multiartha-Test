import { updateUserSchema } from "@/features/users/schemas";
import { deleteUser } from "@/server/application/users/deleteUser";
import { updateUser } from "@/server/application/users/updateUser";
import { ROLES } from "@/server/domain/constants/roles";
import { handleRouteError } from "@/server/http/handleRouteError";
import { jsonOk } from "@/server/http/responses";
import { requireRole } from "@/server/auth/session";

export async function PUT(request, { params }) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const session = await requireRole([ROLES.ADMIN]);

    const body = await request.json();
    const input = updateUserSchema.parse(body);

    const updated = await updateUser({
      actorUserId: session.user.id,
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

    const result = await deleteUser({
      actorUserId: session.user.id,
      targetUserId: resolvedParams.id,
    });

    return jsonOk(result);
  } catch (error) {
    return handleRouteError(error);
  }
}
