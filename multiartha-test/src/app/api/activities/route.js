import { listActivities } from "@/server/application/audit/listActivities";
import { ROLES } from "@/server/domain/constants/roles";
import { handleRouteError } from "@/server/http/handleRouteError";
import { jsonOk } from "@/server/http/responses";
import { requireRole } from "@/server/auth/session";

export async function GET() {
  try {
    await requireRole([ROLES.ADMIN]);
    const items = await listActivities();
    return jsonOk(items);
  } catch (error) {
    return handleRouteError(error);
  }
}
