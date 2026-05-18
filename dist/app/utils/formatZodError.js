"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatZodError = void 0;
const formatZodError = (err) => {
    const issues = err.issues.map((i) => ({
        field: i.path.join("."),
        message: i.message,
    }));
    return {
        message: "Validation failed",
        details: issues,
    };
};
exports.formatZodError = formatZodError;
