import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import { ServiceServices } from "./service.services";
import { FileUploader } from "../../middlewares/fileUploader";

const createService = catchAsync(async (req, res) => {
  const payload = req.body;
  const request = req as any;

  if (request.file) {
    const { relativePath } = await FileUploader.processImage(request.file, "images");
    payload.image = relativePath;
  }

  if (req.user?.role !== "SUPER_ADMIN") {
    payload.organizationId = req.user?.organizationId;
  }

  const result = await ServiceServices.createServiceInDB(payload);

  res.status(httpStatus.OK).json({
    success: true,
    message: "Service created successfully",
    data: result,
  });
});

const getServices = catchAsync(async (req, res) => {
  const query = { ...req.query };
  if (req.user?.role !== "SUPER_ADMIN") {
    query.organizationId = req.user?.organizationId || undefined;
  }
  const result = await ServiceServices.getServicesFromDB(query);

  res.status(httpStatus.OK).json({
    success: true,
    message: "Services fetched successfully",
    data: result,
  });
});

const getSingleService = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await ServiceServices.getSingleServiceFromDB(id as string);

  res.status(httpStatus.OK).json({
    success: true,
    message: "Service fetched successfully",
    data: result,
  });
});


const updateService = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await ServiceServices.updateServiceInDB(
    id as string,
    req.body
  );

  res.status(httpStatus.OK).json({
    success: true,
    message: "Service updated successfully",
    data: result,
  });
});

const deleteService = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await ServiceServices.deleteServiceFromDB(id as string);

  res.status(httpStatus.OK).json({
    success: true,
    message: "Service deleted successfully",
    data: result,
  });
});

const useService = catchAsync(async (req, res) => {
  console.log(req.body);
  const result = await ServiceServices.useServiceFromDB(req.body);

  res.status(httpStatus.OK).json({
    success: true,
    message: "Service used successfully",
    data: result,
  });
});

export const ServiceController = {
  createService,
  getServices,
  getSingleService,
  useService,
  updateService,
  deleteService,
};
