"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatPrismaError = void 0;
const client_1 = require("@prisma/client");
const formatPrismaError = (err) => {
    if (err instanceof client_1.Prisma.PrismaClientValidationError) {
        return {
            message: "Invalid database input",
        };
    }
    if (err instanceof client_1.Prisma.PrismaClientKnownRequestError) {
        return {
            message: "Database operation failed",
            code: err.code,
        };
    }
    return {
        message: "Database error",
    };
};
exports.formatPrismaError = formatPrismaError;
