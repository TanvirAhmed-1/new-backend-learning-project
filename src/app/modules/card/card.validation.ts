import { z } from "zod";

export const createCardSchema = z.object({
  type: z.enum(["NFC", "RFID", "VIRTUAL"]),
  cardUid: z.string().optional(),
  organizationId: z.string().optional(),
});
