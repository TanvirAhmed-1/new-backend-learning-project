"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAppError = void 0;
const createAppError = (statusCode, message, details) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    error.details = details;
    error.name = 'AppError';
    return error;
};
exports.createAppError = createAppError;
