"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CounterValidation = void 0;
const zod_1 = require("zod");
const createCounter = zod_1.z.object({
    name: zod_1.z.string({ message: "Counter name is required" }),
    organizationId: zod_1.z.string().optional(),
});
const updateCounter = zod_1.z.object({
    name: zod_1.z.string().optional(),
    isActive: zod_1.z.boolean().optional(),
    organizationId: zod_1.z.string().optional(),
});
exports.CounterValidation = {
    createCounter,
    updateCounter,
};
