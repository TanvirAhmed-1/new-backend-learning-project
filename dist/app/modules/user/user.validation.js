"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyUserPenaltySchema = exports.checkoutUserSchema = exports.createUserSchema = exports.CardTypeEnum = void 0;
const zod_1 = require("zod");
exports.CardTypeEnum = zod_1.z.enum(["VIRTUAL", "NFC", "RFID"]);
exports.createUserSchema = zod_1.z
    .object({
    phone: zod_1.z
        .string({ message: "Phone is required" })
        .length(11, { message: "Phone number must be exactly 11 digits" }),
    name: zod_1.z.string().optional(),
    email: zod_1.z.string().email().optional(),
    pinHash: zod_1.z
        .string()
        .optional()
        .refine((val) => !val || /^\d{4}$/.test(val), {
        message: "PIN must be exactly 4 digits",
    }),
    cardId: zod_1.z.string().optional(),
    balance: zod_1.z.number().min(0, "Balance must be positive"),
    CardType: exports.CardTypeEnum.optional(),
    eventId: zod_1.z.string().optional(),
    organizationId: zod_1.z.string({
        message: "Organization ID is required",
    }),
})
    // virtual card  Conditional validation
    .refine((data) => {
    if (data.CardType === "VIRTUAL")
        return true;
    return !!data.cardId;
}, {
    message: "Card ID is required for NFC/RFID",
    path: ["cardId"],
});
exports.checkoutUserSchema = zod_1.z.object({
    userId: zod_1.z.string({ message: "User ID is required" }),
    amount: zod_1.z.number({ message: "Amount is required" }),
});
exports.applyUserPenaltySchema = zod_1.z.object({
    userId: zod_1.z.string({ message: "User ID is required" }),
    organizationId: zod_1.z.string().optional(),
});
