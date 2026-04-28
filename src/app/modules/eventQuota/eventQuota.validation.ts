import { z } from "zod";

export const createEventQuotaSchema = z.object({
  eventId: z.string().uuid("Invalid eventId"),

  services: z
    .array(
      z.object({
        serviceId: z.string().uuid("Invalid serviceId"),
        maxUsesPerPerson: z.number().int().min(1).default(1),
      })
    )
    .min(1, "At least one service is required"),
});

export const updateEventQuotaSchema = z.object({
  services: z
    .array(
      z.object({
        serviceId: z.string().uuid("Invalid serviceId"),
        maxUsesPerPerson: z.number().int().min(1).default(1),
      })
    )
    .min(1, "At least one service is required"),
});
