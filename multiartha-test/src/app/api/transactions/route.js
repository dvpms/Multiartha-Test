import { listTransactions } from "@/server/application/transactions/listTransactions";
import { requireRole } from "@/server/auth/session";
import { ROLES } from "@/server/domain/constants/roles";
import { handleRouteError } from "@/server/http/handleRouteError";
import { jsonOk } from "@/server/http/responses";

export async function GET() {
  try {
    await requireRole([ROLES.ADMIN, ROLES.SELLER]);
    const items = await listTransactions();
    return jsonOk(items);
  } catch (error) {
    return handleRouteError(error);
  }
}
