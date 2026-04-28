import { z } from "zod";

const createServiceType = z.object({
  name: z.string({ message: "Service type name is required" }),
});

const updateServiceType = z.object({
  name: z.string().optional(),
});

export const ServiceTypeValidation = {
  createServiceType,
  updateServiceType,
};