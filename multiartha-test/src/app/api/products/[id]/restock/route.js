import { restockProductSchema } from "@/features/products/schemas";
import { requireRole } from "@/server/auth/session";
import { restockProduct } from "@/server/application/products/restockProduct";
import { ROLES } from "@/server/domain/constants/roles";
import { handleRouteError } from "@/server/http/handleRouteError";
import { jsonOk } from "@/server/http/responses";

export async function POST(request, { params }) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const session = await requireRole([ROLES.ADMIN]);

    const body = await request.json();
    const input = restockProductSchema.parse(body);

    const updated = await restockProduct({
      actorUserId: session.user.id,
      productId: resolvedParams.id,
      quantity: input.quantity,
    });

    return jsonOk(updated);
  } catch (error) {
    return handleRouteError(error);
  }
}
