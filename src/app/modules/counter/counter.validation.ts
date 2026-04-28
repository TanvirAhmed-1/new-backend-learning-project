import { z } from "zod";

const createCounter = z.object({
  name: z.string({ message: "Counter name is required" }),
});

const updateCounter = z.object({
  name: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const CounterValidation = {
  createCounter,
  updateCounter,
};
