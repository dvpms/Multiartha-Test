import { ZodError } from "zod";
import { jsonError } from "./responses";
import { AppError } from "../domain/errors/appErrors";

export function handleRouteError(error) {
  if (error instanceof ZodError) {
    return jsonError("Validation error", {
      status: 422,
      code: "VALIDATION_ERROR",
      issues: error.issues,
    });
  }

  if (error instanceof AppError) {
    return jsonError(error.message, { status: error.status, code: error.code });
  }

  console.error(error);
  return jsonError("Internal server error", { status: 500, code: "INTERNAL" });
}
