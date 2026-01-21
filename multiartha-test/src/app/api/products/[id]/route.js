import { updateProductSchema } from "@/features/products/schemas";
import { deleteProduct } from "@/server/application/products/deleteProduct";
import { updateProduct } from "@/server/application/products/updateProduct";
import { ROLES } from "@/server/domain/constants/roles";
import { handleRouteError } from "@/server/http/handleRouteError";
import { jsonOk } from "@/server/http/responses";
import { requireRole } from "@/server/auth/session";

export async function PUT(request, { params }) {
  try {
    const resolvedParams = await Promise.resolve(params);
    await requireRole([ROLES.ADMIN]);

    const body = await request.json();
    const input = updateProductSchema.parse(body);

    const updated = await updateProduct({ productId: resolvedParams.id, data: input });

    return jsonOk(updated);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(_request, { params }) {
  try {
    const resolvedParams = await Promise.resolve(params);
    await requireRole([ROLES.ADMIN]);

    const result = await deleteProduct({ productId: resolvedParams.id });
    return jsonOk(result);
  } catch (error) {
    return handleRouteError(error);
  }
}
