"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceTypeValidation = void 0;
const zod_1 = require("zod");
const createServiceType = zod_1.z.object({
    name: zod_1.z.string({ message: "Service type name is required" }),
});
const updateServiceType = zod_1.z.object({
    name: zod_1.z.string().optional(),
});
exports.ServiceTypeValidation = {
    createServiceType,
    updateServiceType,
};
