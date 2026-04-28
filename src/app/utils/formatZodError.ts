import { ZodError } from "zod";

export const formatZodError = (err: ZodError) => {
  const issues = err.issues.map((i) => ({
    field: i.path.join("."),
    message: i.message,
  }));

  return {
    message: "Validation failed",
    details: issues,
  };
};