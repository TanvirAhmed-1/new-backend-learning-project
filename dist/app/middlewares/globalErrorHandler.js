"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
const formatZodError_1 = require("../utils/formatZodError");
const prismaErrorFormatter_1 = require("../utils/prismaErrorFormatter");
const globalErrorHandler = (err, req, res, next) => {
    // ======================
    // ZOD ERROR
    // ======================
    if (err instanceof zod_1.ZodError) {
        const formatted = (0, formatZodError_1.formatZodError)(err);
        return res.status(400).json({
            success: false,
            message: formatted.message,
            errorDetails: formatted.details,
        });
    }
    // ======================
    // PRISMA ERROR
    // ======================
    if ((err === null || err === void 0 ? void 0 : err.name) === "PrismaClientKnownRequestError" ||
        (err === null || err === void 0 ? void 0 : err.name) === "PrismaClientValidationError") {
        const formatted = (0, prismaErrorFormatter_1.formatPrismaError)(err);
        return res.status(400).json({
            success: false,
            message: formatted.message,
            errorCode: formatted.code,
        });
    }
    // ======================
    // CUSTOM APP ERROR
    // ======================
    if ((err === null || err === void 0 ? void 0 : err.name) === 'AppError') {
        const appErr = err;
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
        message: (err === null || err === void 0 ? void 0 : err.message) || "Internal Server Error",
    });
};
exports.default = globalErrorHandler;
