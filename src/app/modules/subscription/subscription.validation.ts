import { z } from "zod";
import { BillingCycle } from "@prisma/client";

const createPlanSchema = z.object({
  body: z.object({
    name: z.string(),
    description: z.string().optional(),
    price: z.number().nonnegative(),
    billingCycle: z.nativeEnum(BillingCycle).optional(),
    maxUsers: z.number().int().positive().optional(),
    maxEvents: z.number().int().positive().optional(),
    maxStaffs: z.number().int().positive().optional(),
  }),
});

const buySubscriptionSchema = z.object({
  body: z.object({
    planId: z.string(),
    paymentMethod: z.string(),
    transactionId: z.string(),
  }),
});

export const SubscriptionValidation = {
  createPlanSchema,
  buySubscriptionSchema,
};
