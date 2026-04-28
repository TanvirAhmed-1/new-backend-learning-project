import { z } from "zod";

export const createOrganization = z.object({
  name: z.string({ message: "Name is required" }),
  cardDamageFee: z.number({ message: "Card damage fee is required" }),
});
