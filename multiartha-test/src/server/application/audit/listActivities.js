import { auditLogRepo } from "../../infrastructure/repositories/auditLogRepo";

export async function listActivities() {
  return auditLogRepo.listLatest();
}
