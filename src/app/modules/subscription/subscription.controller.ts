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
  const payload = { ...req.body };

  // Tenant locking - non-super admins can only purchase for their own organization
  if (req.user?.role !== "SUPER_ADMIN") {
    payload.organizationId = req.user?.organizationId;
  } else if (!payload.organizationId) {
    throw new Error("organizationId is required for SUPER_ADMIN purchases");
  }

  const result = await SubscriptionServices.buySubscriptionInDB(payload);

  res.status(httpStatus.OK).json({
    success: true,
    message: "Subscription purchased successfully",
    data: result,
  });
});

const getOrganizationSubscription = catchAsync(async (req, res) => {
  let orgId = req.params.orgId as string;

  // Tenant locking
  if (req.user?.role !== "SUPER_ADMIN") {
    orgId = req.user?.organizationId as string;
  }

  if (!orgId) {
    throw new Error("orgId parameter is required");
  }

  const result = await SubscriptionServices.getOrganizationSubscriptionFromDB(orgId);

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
