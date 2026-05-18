"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionController = void 0;
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const http_status_1 = __importDefault(require("http-status"));
const transaction_services_1 = require("./transaction.services");
const getTransactions = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const query = Object.assign({}, req.query);
    if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== "SUPER_ADMIN") {
        query.organizationId = ((_b = req.user) === null || _b === void 0 ? void 0 : _b.organizationId) || undefined;
    }
    const result = yield transaction_services_1.TransactionServices.getTransactionsFromDB(query);
    res.status(http_status_1.default.OK).json({
        success: true,
        message: "Transactions fetched successfully",
        data: result,
    });
}));
const getCounterWiseSales = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const query = Object.assign({}, req.query);
    if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== "SUPER_ADMIN") {
        query.organizationId = ((_b = req.user) === null || _b === void 0 ? void 0 : _b.organizationId) || undefined;
    }
    const result = yield transaction_services_1.TransactionServices.getCounterWiseSalesFormDB(query);
    res.status(http_status_1.default.OK).json({
        success: true,
        message: "Transactions fetched successfully",
        data: result,
    });
}));
const getDailyLedger = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const query = Object.assign({}, req.query);
    if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== "SUPER_ADMIN") {
        query.organizationId = ((_b = req.user) === null || _b === void 0 ? void 0 : _b.organizationId) || undefined;
    }
    const result = yield transaction_services_1.TransactionServices.getDailyLedgerFormDB(query);
    res.status(http_status_1.default.OK).json({
        success: true,
        message: "Transactions fetched successfully",
        data: result,
    });
}));
const topupTransaction = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const payload = Object.assign({}, req.body);
    if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== "SUPER_ADMIN") {
        payload.organizationId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.organizationId;
    }
    const result = yield transaction_services_1.TransactionServices.topupTransactionFromDB(payload);
    res.status(http_status_1.default.OK).json({
        success: true,
        message: "Topup completed successfully",
        data: result,
    });
}));
exports.TransactionController = {
    getTransactions,
    getCounterWiseSales,
    getDailyLedger,
    topupTransaction,
};
