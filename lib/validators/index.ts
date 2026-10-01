export * from "./auth";
export * from "./admin";
export * from "./content";
export * from "./notice";
export * from "./questions-import";
export { successStoryReorderSchema } from "./success-story";

import type { ZodError } from "zod";

export function formatZodError(
  error: ZodError,
): { message: string; field?: string } {
  const issue = error.issues[0];
  const field = issue?.path.map(String).join(".");

  return {
    message: issue?.message ?? "Please check the information and try again.",
    ...(field ? { field } : {}),
  };
}
