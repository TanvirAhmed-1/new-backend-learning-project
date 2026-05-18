import { z } from "zod";
export const CardTypeEnum = z.enum(["VIRTUAL", "NFC", "RFID"]);

export const createUserSchema = z
  .object({
    phone: z
      .string({ message: "Phone is required" })
      .length(11, { message: "Phone number must be exactly 11 digits" }),

    name: z.string().optional(),

    email: z.string().email().optional(),

    pinHash: z
      .string()
      .optional()
      .refine((val) => !val || /^\d{4}$/.test(val), {
        message: "PIN must be exactly 4 digits",
      }),
    cardId: z.string().optional(),

    balance: z.coerce.number().min(0, "Balance must be positive"),

    CardType: CardTypeEnum.optional(),
    eventId: z.string().optional(),
    organizationId: z.string({
      message: "Organization ID is required",
    }),
  })
  // virtual card  Conditional validation
  .refine(
    (data) => {
      if (data.CardType === "VIRTUAL") return true;
      return !!data.cardId;
    },
    {
      message: "Card ID is required for NFC/RFID",
      path: ["cardId"],
    }
  );

export const checkoutUserSchema = z.object({
  userId: z.string({ message: "User ID is required" }),
  amount: z.coerce.number({ message: "Amount is required" }),
});

export const applyUserPenaltySchema = z.object({
  userId: z.string({ message: "User ID is required" }),
  organizationId: z.string().optional(),
});
