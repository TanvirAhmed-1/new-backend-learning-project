import catchAsync from "../../utils/catchAsync";
import httpStatus from "http-status";
import { DashboardServices } from "./dashboard.services";

const getDashboardStats = catchAsync(async (req, res) => {
  const query = { ...req.query };
  
  // Enforce SaaS strict isolation: Non-SUPER_ADMIN staff can only view their own organization's stats.
  let organizationId: string | undefined = undefined;
  if (req.user?.role !== "SUPER_ADMIN") {
    organizationId = req.user?.organizationId as string;
  } else if (req.query.organizationId) {
    organizationId = req.query.organizationId as string;
  }

  const result = await DashboardServices.getDashboardStatsFromDB(organizationId, query);

  res.status(httpStatus.OK).json({
    success: true,
    message: "Dashboard analytics statistics fetched successfully",
    data: result,
  });
});

export const DashboardController = {
  getDashboardStats,
};
