import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import { SubscriptionServices } from "./subscription.services";

const createPlan = catchAsync(async (req, res) => {
  const result = await SubscriptionServices.createPlanInDB(req.body);

  res.status(httpStatus.CREATED).json({
    success: true,
    message: "Subscription plan created successfully",
    data: result,
  });
});

const getAllPlans = catchAsync(async (req, res) => {
  const result = await SubscriptionServices.getAllPlansFromDB();

  res.status(httpStatus.OK).json({
    success: true,
    message: "Subscription plans fetched successfully",
    data: result,
  });
});

const buySubscription = catchAsync(async (req, res) => {
  const data = req.body;
  const organizationId = req.user?.organizationId;
  const payload = { ...data, organizationId };

  const result = await SubscriptionServices.buySubscriptionInDB(payload);

  res.status(httpStatus.OK).json({
    success: true,
    message: "Subscription purchased successfully",
    data: result,
  });
});

const getOrganizationSubscription = catchAsync(async (req, res) => {
  const organizationId = req.user?.organizationId;

  if (!organizationId) {
    throw new Error("Organization ID is required");
  }

  const result = await SubscriptionServices.getOrganizationSubscriptionFromDB(organizationId);

  res.status(httpStatus.OK).json({
    success: true,
    message: "Subscription status fetched successfully",
    data: result,
  });
});

export const SubscriptionController = {
  createPlan,
  getAllPlans,
  buySubscription,
  getOrganizationSubscription,
};
