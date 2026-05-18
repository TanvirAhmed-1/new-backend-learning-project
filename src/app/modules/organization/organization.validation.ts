import { z } from "zod";

export const createOrganization = z.object({
  name: z.string({ message: "Name is required" }),
  cardDamageFee: z.number({ message: "Card damage fee is required" }).optional(),
  country: z.enum(["BANGLADESH", "GLOBAL"]).optional(),
  creatorId: z.string().optional(),
});

export const registerTenantValidation = z.object({
  orgName: z.string({ message: "Organization name is required" }),
  cardDamageFee: z.number().optional(),
  adminName: z.string({ message: "Admin name is required" }),
  adminEmail: z.string({ message: "Admin email is required" }).email({ message: "Invalid email address" }),
  adminPhone: z.string({ message: "Admin phone is required" }),
  adminPassword: z.string({ message: "Admin password is required" }).min(6, { message: "Password must be at least 6 characters" }),
});
