"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionValidation = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
const createPlanSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string(),
        description: zod_1.z.string().optional(),
        price: zod_1.z.number().nonnegative(),
        billingCycle: zod_1.z.nativeEnum(client_1.BillingCycle).optional(),
        maxUsers: zod_1.z.number().int().positive().optional(),
        maxEvents: zod_1.z.number().int().positive().optional(),
        maxStaffs: zod_1.z.number().int().positive().optional(),
    }),
});
const buySubscriptionSchema = zod_1.z.object({
    body: zod_1.z.object({
        planId: zod_1.z.string(),
        paymentMethod: zod_1.z.string(),
        transactionId: zod_1.z.string(),
    }),
});
exports.SubscriptionValidation = {
    createPlanSchema,
    buySubscriptionSchema,
};
