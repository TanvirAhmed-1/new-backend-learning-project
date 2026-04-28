import httpStatus from "http-status";
import { EventQuotaServices } from "./eventQuota.services";
import catchAsync from "../../utils/catchAsync";

const createEventQuota = catchAsync(async (req, res) => {
  const result = await EventQuotaServices.createEventQuota(req.body);

  res.status(httpStatus.OK).json({
    success: true,
    message: "Event quota created successfully",
    data: result,
  });
});

const getAllEventQuota = catchAsync(async (req, res) => {
  const result = await EventQuotaServices.getAllEventQuota(req.query);

  res.status(httpStatus.OK).json({
    success: true,
    message: "Event quota fetched successfully",
    data: result,
  });
});

const updateEventQuota = catchAsync(async (req, res) => {
    const eventId = req.params.eventId as string;
    const { services } = req.body;
  
    if (!eventId) {
      throw new Error("eventId is required");
    }
  
    if (!Array.isArray(services) || services.length === 0) {
      throw new Error("services must be a non-empty array");
    }
  
    const result = await EventQuotaServices.updateEventQuota({
      eventId,
      services,
    });
  
    res.status(httpStatus.OK).json({
      success: true,
      message: "Event quota updated successfully",
      data: result,
    });
  });

const deleteEventQuota = catchAsync(async (req, res) => {
  const { id } = req.params;

  const result = await EventQuotaServices.deleteEventQuota(id as string);

  res.status(httpStatus.OK).json({
    success: true,
    message: "Event quota deleted successfully",
    data: result,
  });
});

export const EventQuotaController = {
  createEventQuota,
  getAllEventQuota,
  updateEventQuota,
  deleteEventQuota,
};
