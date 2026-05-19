import catchAsync from "../../utils/catchAsync";
import httpStatus from "http-status";
import { TransactionServices } from "./transaction.services";

const getTransactions = catchAsync(async (req, res) => {
  const query = req.query;
  const organizationId = req.user?.organizationId;
  const result = await TransactionServices.getTransactionsFromDB(query, organizationId as string);

  res.status(httpStatus.OK).json({
    success: true,
    message: "Transactions fetched successfully",
    data: result,
  });
});

const getCounterWiseSales = catchAsync(async (req, res) => {
  const query = req.query;
  const organizationId = req.user?.organizationId;
  const result = await TransactionServices.getCounterWiseSalesFormDB(query, organizationId as string);

  res.status(httpStatus.OK).json({
    success: true,
    message: "Transactions fetched successfully",
    data: result,
  });
});

const getDailyLedger = catchAsync(async (req, res) => {
  const query = req.query;
  const organizationId = req.user?.organizationId;
  const result = await TransactionServices.getDailyLedgerFormDB(query, organizationId as string);

  res.status(httpStatus.OK).json({
    success: true,
    message: "Transactions fetched successfully",
    data: result,
  });
});

const topupTransaction = catchAsync(async (req, res) => {
  const data = req.body;
  const organizationId = req.user?.organizationId;
  const payload = { ...data, organizationId };
  const result = await TransactionServices.topupTransactionFromDB(payload);

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
