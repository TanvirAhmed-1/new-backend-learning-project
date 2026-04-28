import { z } from "zod";

const topupTransactionValidation = z.object({
  cardUid: z.string({ message: "cardUid is required" }),
  userId: z.string().uuid({ message: "userId is required" }),
  amount: z.number({ message: "amount is required" }).positive("Amount must be greater than zero"),
  staffId: z.string().uuid().optional(),
  counterId: z.string().uuid().optional(),
});

export const TransactionValidation = {
  topupTransactionValidation,
};
