import catchAsync from "../../utils/catchAsync";
import { OrganizationServices } from "./organization.services";
import httpStatus from "http-status";

const getOrganization = catchAsync(async (req, res) => {
  const result = await OrganizationServices.getOrganizationFormDB();
  
  // Enforce SaaS strict tenancy check
  const filteredData = req.user?.role === "SUPER_ADMIN"
    ? result
    : result.filter((org) => org.id === req.user?.organizationId);

  res.status(httpStatus.OK).json({
    success: true,
    message: "Organization fetched successfully",
    data: filteredData,
  });
});

const CreateOrganization = catchAsync(async (req, res) => {
  const payload = {
    ...req.body,
    creatorId: req.user?.id,
  };
  const result = await OrganizationServices.CreateOrganizationInDB(payload);
  res.status(httpStatus.OK).json({
    success: true,
    message: "Organization created successfully",
    data: result,
  });
});

const updateOrganization = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await OrganizationServices.updateOrganizationInDB(id as string, req.body);
  res.status(httpStatus.OK).json({
    success: true,
    message: "Organization updated successfully",
    data: result,
  });
});
const deleteOrganization = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await OrganizationServices.deleteOrganizationInDB(id as string);
  res.status(httpStatus.OK).json({
    success: true,
    message: "Organization deleted successfully",
    data: result,
  });
});

const registerTenant = catchAsync(async (req, res) => {
  const result = await OrganizationServices.registerTenantInDB(req.body);
  res.status(httpStatus.CREATED).json({
    success: true,
    message: "Tenant registered successfully! A 30-day Free Trial has been activated.",
    data: result,
  });
});

export const OrganizationController = {
  getOrganization,
  CreateOrganization,
  updateOrganization,
  deleteOrganization,
  registerTenant,
};
