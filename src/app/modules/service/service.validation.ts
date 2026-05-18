import { z } from "zod";

const createService = z.object({
  name: z.string({ message: "Service name is required" }),
  price: z.coerce.number({ message: "Price is required" }),

  image: z.string().optional(),
  description: z.string().optional(),

  serviceTypeId: z.string(),
  counterId: z.string().optional(),
  staffId: z.string().optional(),
  organizationId: z.string().optional(),
});

const updateService = z.object({
  name: z.string().optional(),
  price: z.number().optional(),
  image: z.string().optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
  counterId: z.string().optional(),
  staffId: z.string().optional(),
  organizationId: z.string().optional(),
});

const useServiceValidation = z.object({
  cardUid: z.string({ message: "Card ID is required" }),
  serviceId: z.string().uuid({ message: "Service ID is required" }),
  qty: z.number({ message: "Quantity is required" }).optional(),
});

export const ServiceValidation = {
  createService,
  updateService,
  useServiceValidation
};