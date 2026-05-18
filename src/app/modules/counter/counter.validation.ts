import { z } from "zod";

const createCounter = z.object({
  name: z.string({ message: "Counter name is required" }),
  organizationId: z.string().optional(),
});

const updateCounter = z.object({
  name: z.string().optional(),
  isActive: z.boolean().optional(),
  organizationId: z.string().optional(),
});

export const CounterValidation = {
  createCounter,
  updateCounter,
};
