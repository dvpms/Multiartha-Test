import { createProductSchema } from "@/features/products/schemas";
import { createProduct } from "@/server/application/products/createProduct";
import { listProducts } from "@/server/application/products/listProducts";
import { ROLES } from "@/server/domain/constants/roles";
import { handleRouteError } from "@/server/http/handleRouteError";
import { jsonOk } from "@/server/http/responses";
import { requireRole, requireSession } from "@/server/auth/session";

export async function GET() {
  try {
    await requireSession();
    const products = await listProducts();
    return jsonOk(products);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request) {
  try {
    await requireRole([ROLES.ADMIN]);
    const body = await request.json();
    const input = createProductSchema.parse(body);
    const created = await createProduct({ data: input });
    return jsonOk(created, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
