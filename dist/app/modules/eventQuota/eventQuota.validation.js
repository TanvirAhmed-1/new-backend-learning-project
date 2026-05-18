"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateEventQuotaSchema = exports.createEventQuotaSchema = void 0;
const zod_1 = require("zod");
exports.createEventQuotaSchema = zod_1.z.object({
    eventId: zod_1.z.string().uuid("Invalid eventId"),
    services: zod_1.z
        .array(zod_1.z.object({
        serviceId: zod_1.z.string().uuid("Invalid serviceId"),
        maxUsesPerPerson: zod_1.z.number().int().min(1).default(1),
    }))
        .min(1, "At least one service is required"),
});
exports.updateEventQuotaSchema = zod_1.z.object({
    services: zod_1.z
        .array(zod_1.z.object({
        serviceId: zod_1.z.string().uuid("Invalid serviceId"),
        maxUsesPerPerson: zod_1.z.number().int().min(1).default(1),
    }))
        .min(1, "At least one service is required"),
});
