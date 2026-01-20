import { getServerSession } from "next-auth";
import { authOptions } from "./nextauth";
import { ForbiddenError, UnauthorizedError } from "../domain/errors/appErrors";

export async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new UnauthorizedError();
  return session;
}

export async function requireRole(allowedRoles) {
  const session = await requireSession();
  const role = session.user?.role;
  if (!role || !allowedRoles.includes(role)) throw new ForbiddenError();
  return session;
}
