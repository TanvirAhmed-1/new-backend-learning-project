import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import { ServiceTypeServices } from "./serviceType.services";

const createServiceType = catchAsync(async (req, res) => {
  const payload = { ...req.body };
  if (req.user?.role !== "SUPER_ADMIN") {
    payload.organizationId = req.user?.organizationId;
  }
  const result = await ServiceTypeServices.createServiceTypeInDB(payload);

  res.status(httpStatus.OK).json({
    success: true,
    message: "Service type created successfully",
    data: result,
  });
});

const getAllServiceTypes = catchAsync(async (req, res) => {
  const query = { ...req.query };
  if (req.user?.role !== "SUPER_ADMIN") {
    query.organizationId = req.user?.organizationId || undefined;
  }
  const result = await ServiceTypeServices.getAllServiceTypesFromDB(query);

  res.status(httpStatus.OK).json({
    success: true,
    message: "Service types fetched successfully",
    data: result,
  });
});

const getSingleServiceType = catchAsync(async (req, res) => {
  const { id } = req.params;

  const result = await ServiceTypeServices.getSingleServiceTypeFromDB(id as string);

  res.status(httpStatus.OK).json({
    success: true,
    message: "Service type fetched successfully",
    data: result,
  });
});

const updateServiceType = catchAsync(async (req, res) => {
  const { id } = req.params;

  const result = await ServiceTypeServices.updateServiceTypeInDB(id as string, req.body);

  res.status(httpStatus.OK).json({
    success: true,
    message: "Service type updated successfully",
    data: result,
  });
});

const deleteServiceType = catchAsync(async (req, res) => {
  const { id } = req.params;

  const result = await ServiceTypeServices.deleteServiceTypeFromDB(id as string);

  res.status(httpStatus.OK).json({
    success: true,
    message: "Service type deleted successfully",
    data: result,
  });
});

export const ServiceTypeController = {
  createServiceType,
  getAllServiceTypes,
  getSingleServiceType,
  updateServiceType,
  deleteServiceType,
};
