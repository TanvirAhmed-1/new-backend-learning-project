import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import { EventService } from "./event.services";

const createEvent = catchAsync(async (req, res) => {
  const payload = {
    ...req.body,
    creatorId: req.user?.id,
  };

  if (req.user?.role !== "SUPER_ADMIN") {
    payload.organizationId = req.user?.organizationId;
  }

  const result = await EventService.createEvent(payload);

  res.status(httpStatus.OK).json({
    success: true,
    message: "Event created successfully",
    data: result,
  });
});

const getAllEvent = catchAsync(async (req, res) => {
  const query = { ...req.query };

  if (req.user?.role !== "SUPER_ADMIN") {
    query.organizationId = req.user?.organizationId || undefined;
  }

  const result = await EventService.getAllEvent(query);

  res.status(httpStatus.OK).json({
    success: true,
    message: "Events fetched successfully",
    data: result,
  });
});

const getSingleEventUser = catchAsync(async (req, res) => {
  const { id } = req.params;

  const result = await EventService.getSingleEventUserFormDB(id as string);

  res.status(httpStatus.OK).json({
    success: true,
    message: "Event Users fetched successfully",
    data: result,
  });
});

const getSingleEventQuota = catchAsync(async (req, res) => {
  const { id } = req.params;

  const result = await EventService.getSingleEventQuotaFormDB(id as string);

  res.status(httpStatus.OK).json({
    success: true,
    message: "Event Quota fetched successfully",
    data: result,
  });
});

const updateEvent = catchAsync(async (req, res) => {
  const { id } = req.params;

  const result = await EventService.updateEvent(id as string, req.body);

  res.status(httpStatus.OK).json({
    success: true,
    message: "Event updated successfully",
    data: result,
  });
});

const deleteEvent = catchAsync(async (req, res) => {
  const { id } = req.params;

  const result = await EventService.deleteEvent(id as string);

  res.status(httpStatus.OK).json({
    success: true,
    message: "Event deleted successfully",
    data: result,
  });
});

const lockEventController = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await EventService.lockEvent(id as string);

  res.status(httpStatus.OK).json({
    success: true,
    message: "Event locked successfully",
    data: result,
  });
});



const getEventAnalytics = catchAsync(async (req, res) => {
  const query = { ...req.query };

  if (req.user?.role !== "SUPER_ADMIN") {
    query.organizationId = req.user?.organizationId || undefined;
  }

  const result = await EventService.getEventAnalyticsFormDB(query);

  res.status(httpStatus.OK).json({
    success: true,
    message: "Event analytics fetched successfully",
    data: result,
  });
});

const getSingleEventAnalytics = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await EventService.getSingleEventAnalyticsFormDB(id as string, req.query);

  res.status(httpStatus.OK).json({
    success: true,
    message: "Single event analytics fetched successfully",
    data: result,
  });
});

const getAllEventUsers = catchAsync(async (req, res) => {
  const result = await EventService.getAllEventUserFormDB(req.query);

  res.status(httpStatus.OK).json({
    success: true,
    message: "Event users fetched successfully",
    data: result,
  });
});

const deleteEventUser = catchAsync(async (req, res) => {
  const { eventId, userId } = req.body;

  const result = await EventService.deleteeventUserFormDB(eventId as string, userId as string);

  res.status(httpStatus.OK).json({
    success: true,
    message: "Event user removed successfully",
    data: result,
  });
});

export const EventController = {
  createEvent,
  getAllEvent,
  getSingleEventUser,
  getSingleEventQuota,
  updateEvent,
  deleteEvent,
  lockEventController,
  getEventAnalytics,
  getAllEventUsers,
  deleteEventUser,
  getSingleEventAnalytics,
};
