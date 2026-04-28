import catchAsync from "../../utils/catchAsync";
import httpStatus from "http-status";
import { TransactionServices } from "./transaction.services";

const getTransactions = catchAsync(async (req, res) => {
  const result = await TransactionServices.getTransactionsFromDB(req.query);

  res.status(httpStatus.OK).json({
    success: true,
    message: "Transactions fetched successfully",
    data: result,
  });
});
const getCounterWiseSales = catchAsync(async (req, res) => {
  const result = await TransactionServices.getCounterWiseSalesFormDB(req.query);

  res.status(httpStatus.OK).json({
    success: true,
    message: "Transactions fetched successfully",
    data: result,
  });
});
const getDailyLedger = catchAsync(async (req, res) => {
  const result = await TransactionServices.getDailyLedgerFormDB(req.query);

  res.status(httpStatus.OK).json({
    success: true,
    message: "Transactions fetched successfully",
    data: result,
  });
});

const topupTransaction = catchAsync(async (req, res) => {
  const result = await TransactionServices.topupTransactionFromDB(req.body);

  res.status(httpStatus.OK).json({
    success: true,
    message: "Topup completed successfully",
    data: result,
  });
});

export const TransactionController = {
  getTransactions,
  getCounterWiseSales,
  getDailyLedger,
  topupTransaction,
};
