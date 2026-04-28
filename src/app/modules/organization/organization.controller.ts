import catchAsync from "../../utils/catchAsync";
import { OrganizationServices } from "./organization.services";
import httpStatus from "http-status";

const getOrganization = catchAsync(async (req, res) => {
  const result = await OrganizationServices.getOrganizationFormDB();
  res.status(httpStatus.OK).json({
    success: true,
    message: "Organization fetched successfully",
    data: result,
  });
});

const CreateOrganization = catchAsync(async (req, res) => {
  const result = await OrganizationServices.CreateOrganizationInDB(req.body);
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
})

export const OrganizationController = {
  getOrganization,
  CreateOrganization,
  updateOrganization,
  deleteOrganization
};
