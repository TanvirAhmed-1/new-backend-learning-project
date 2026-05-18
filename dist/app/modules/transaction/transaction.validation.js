"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionValidation = void 0;
const zod_1 = require("zod");
const topupTransactionValidation = zod_1.z.object({
    cardUid: zod_1.z.string({ message: "cardUid is required" }),
    userId: zod_1.z.string().uuid({ message: "userId is required" }),
    amount: zod_1.z.number({ message: "amount is required" }).positive("Amount must be greater than zero"),
    staffId: zod_1.z.string().uuid().optional(),
    counterId: zod_1.z.string().uuid().optional(),
});
exports.TransactionValidation = {
    topupTransactionValidation,
};
