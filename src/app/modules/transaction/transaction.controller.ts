import catchAsync from "../../utils/catchAsync";
import httpStatus from "http-status";
import { TransactionServices } from "./transaction.services";

const getTransactions = catchAsync(async (req, res) => {
  const query = { ...req.query };
  if (req.user?.role !== "SUPER_ADMIN") {
    query.organizationId = req.user?.organizationId || undefined;
  }
  const result = await TransactionServices.getTransactionsFromDB(query);

  res.status(httpStatus.OK).json({
    success: true,
    message: "Transactions fetched successfully",
    data: result,
  });
});
const getCounterWiseSales = catchAsync(async (req, res) => {
  const query = { ...req.query };
  if (req.user?.role !== "SUPER_ADMIN") {
    query.organizationId = req.user?.organizationId || undefined;
  }
  const result = await TransactionServices.getCounterWiseSalesFormDB(query);

  res.status(httpStatus.OK).json({
    success: true,
    message: "Transactions fetched successfully",
    data: result,
  });
});
const getDailyLedger = catchAsync(async (req, res) => {
  const query = { ...req.query };
  if (req.user?.role !== "SUPER_ADMIN") {
    query.organizationId = req.user?.organizationId || undefined;
  }
  const result = await TransactionServices.getDailyLedgerFormDB(query);

  res.status(httpStatus.OK).json({
    success: true,
    message: "Transactions fetched successfully",
    data: result,
  });
});

const topupTransaction = catchAsync(async (req, res) => {
  const payload = { ...req.body };
  if (req.user?.role !== "SUPER_ADMIN") {
    payload.organizationId = req.user?.organizationId;
  }
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
