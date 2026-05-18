"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionRoutes = void 0;
const express_1 = require("express");
const requestValidation_1 = __importDefault(require("../../middlewares/requestValidation"));
const transaction_controller_1 = require("./transaction.controller");
const transaction_validation_1 = require("./transaction.validation");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
router.get("/transactions", (0, auth_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN, client_1.Role.MANAGER, client_1.Role.OPERATOR), transaction_controller_1.TransactionController.getTransactions);
router.get("/counter-wise-sales", (0, auth_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN, client_1.Role.MANAGER, client_1.Role.OPERATOR), transaction_controller_1.TransactionController.getCounterWiseSales);
router.get("/daily-ledger", (0, auth_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN, client_1.Role.MANAGER, client_1.Role.OPERATOR), transaction_controller_1.TransactionController.getDailyLedger);
router.post("/topup-transaction", (0, auth_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN, client_1.Role.MANAGER, client_1.Role.OPERATOR), (0, requestValidation_1.default)(transaction_validation_1.TransactionValidation.topupTransactionValidation), transaction_controller_1.TransactionController.topupTransaction);
exports.TransactionRoutes = router;
