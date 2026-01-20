import { sellProductSchema } from "@/features/products/schemas";
import { sellProduct } from "@/server/application/products/sellProduct";
import { ROLES } from "@/server/domain/constants/roles";
import { handleRouteError } from "@/server/http/handleRouteError";
import { jsonOk } from "@/server/http/responses";
import { requireRole } from "@/server/auth/session";

export async function POST(request, { params }) {
  try {
    const session = await requireRole([ROLES.ADMIN, ROLES.SELLER]);
    const body = await request.json();
    const input = sellProductSchema.parse(body);

    const result = await sellProduct({
      productId: params.id,
      userId: session.user.id,
      quantity: input.quantity,
    });

    return jsonOk(result, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
