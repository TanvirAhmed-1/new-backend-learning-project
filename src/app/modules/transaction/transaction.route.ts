import { Router } from "express";
import requestValidation from "../../middlewares/requestValidation";
import { TransactionController } from "./transaction.controller";
import { TransactionValidation } from "./transaction.validation";
import auth from "../../middlewares/auth";
import { Role } from "@prisma/client";

const router = Router();

router.get(
  "/transactions",
  auth(Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER, Role.OPERATOR),
  TransactionController.getTransactions
);
router.get(
  "/counter-wise-sales",
  auth(Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER, Role.OPERATOR),
  TransactionController.getCounterWiseSales
);
router.get(
  "/daily-ledger",
  auth(Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER, Role.OPERATOR),
  TransactionController.getDailyLedger
);

router.post(
  "/topup-transaction",
  auth(Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER, Role.OPERATOR),
  requestValidation(TransactionValidation.topupTransactionValidation),
  TransactionController.topupTransaction
);

export const TransactionRoutes = router;