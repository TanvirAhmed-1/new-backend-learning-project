import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { AppError } from "../errors/AppError";
import { formatZodError } from "../utils/formatZodError";
import { formatPrismaError } from "../utils/prismaErrorFormatter";

const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // ======================
  // ZOD ERROR
  // ======================
  if (err instanceof ZodError) {
    const formatted = formatZodError(err);

    return res.status(400).json({
      success: false,
      message: formatted.message,
      errorDetails: formatted.details,
    });
  }

  // ======================
  // PRISMA ERROR
  // ======================
  if (
    err?.name === "PrismaClientKnownRequestError" ||
    err?.name === "PrismaClientValidationError"
  ) {
    const formatted = formatPrismaError(err);

    return res.status(400).json({
      success: false,
      message: formatted.message,
      errorCode: formatted.code,
    });
  }

  // ======================
  // CUSTOM APP ERROR
  // ======================
  if (err?.name === 'AppError') {
    const appErr = err as AppError;
    return res.status(appErr.statusCode).json({
      success: false,
      message: appErr.message,
      errorDetails: appErr.details,
    });
  }

  // ======================
  // DEFAULT ERROR
  // ======================
  return res.status(500).json({
    success: false,
    message: err?.message || "Internal Server Error",
  });
};

export default globalErrorHandler;
