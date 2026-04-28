import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import { CounterServices } from "./counter.services";

const createCounter = catchAsync(async (req: Request, res: Response) => {
  const result = await CounterServices.createCounterInDB(req.body);
  res.status(httpStatus.OK).json({
    success: true,
    message: "Counter created successfully",
    data: result,
  });
});

const getAllCounters = catchAsync(async (req: Request, res: Response) => {
  const result = await CounterServices.getAllCountersFromDB( req.query);
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
  const result = await CounterServices.updateCounterInDB(id as string, req.body);
  res.status(httpStatus.OK).json({
    success: true,
    message: "Counter updated successfully",
    data: result,
  });
});

const deleteCounter = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await CounterServices.deleteCounterFromDB(id as string);
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
