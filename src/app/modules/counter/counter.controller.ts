import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import { CounterServices } from "./counter.services";

const createCounter = catchAsync(async (req: Request, res: Response) => {
  const data = req.body;
  const organizationId = req.user?.organizationId;
  const payload = { ...data, organizationId };
  const result = await CounterServices.createCounterInDB(payload);
  res.status(httpStatus.OK).json({
    success: true,
    message: "Counter created successfully",
    data: result,
  });
});

const getAllCounters = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;
  const organizationId = req.user?.organizationId;
  const result = await CounterServices.getAllCountersFromDB(query, organizationId as string);
  res.status(httpStatus.OK).json({
    success: true,
    message: "Counters fetched successfully",
    data: result,
  });
});

const getSingleCounter = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await CounterServices.getSingleCounterFromDB(id as string);
  res.status(httpStatus.OK).json({
    success: true,
    message: "Counter fetched successfully",
    data: result,
  });
});

const updateCounter = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = req.body;
  const organizationId = req.user?.organizationId;
  const result = await CounterServices.updateCounterInDB(
    id as string,
    organizationId as string,
    data
  );

  res.status(httpStatus.OK).json({
    success: true,
    message: "Counter updated successfully",
    data: result,
  });
});

const deleteCounter = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const organizationId = req.user?.organizationId;

  const result = await CounterServices.deleteCounterFromDB(
    id as string,
    organizationId as string
  );

  res.status(httpStatus.OK).json({
    success: true,
    message: "Counter deleted successfully",
    data: result,
  });
});

export const CounterController = {
  createCounter,
  getAllCounters,
  getSingleCounter,
  updateCounter,
  deleteCounter,
};
