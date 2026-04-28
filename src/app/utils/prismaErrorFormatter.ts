import { Prisma } from "@prisma/client";

export const formatPrismaError = (err: unknown) => {
  if (err instanceof Prisma.PrismaClientValidationError) {
    return {
      message: "Invalid database input",
    };
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    return {
      message: "Database operation failed",
      code: err.code,
    };
  }

  return {
    message: "Database error",
  };
};