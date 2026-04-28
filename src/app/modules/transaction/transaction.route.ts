import { Router } from "express";
import requestValidation from "../../middlewares/requestValidation";
import { TransactionController } from "./transaction.controller";
import { TransactionValidation } from "./transaction.validation";

const router = Router();

router.get("/transactions", TransactionController.getTransactions);
router.get("/counter-wise-sales", TransactionController.getCounterWiseSales);
router.get("/daily-ledger", TransactionController.getDailyLedger);

router.post(
  "/topup-transaction",
  requestValidation(TransactionValidation.topupTransactionValidation),
  TransactionController.topupTransaction
);

export const TransactionRoutes = router;