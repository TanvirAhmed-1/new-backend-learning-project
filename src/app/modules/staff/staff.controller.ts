import catchAsync from "../../utils/catchAsync";
import { StaffServices } from "./staff.services";
import httpStatus from "http-status";

const getStaff = catchAsync(async (req, res) => {
  const result = await StaffServices.getStaffFromDB(req.query);
  res.status(httpStatus.OK).json({
    success: true,
    message: "Staff fetched successfully",
    data: result,
  });
});

const login=catchAsync(async(req,res)=>{
  const {email,password}=req.body;
  const result=await StaffServices.loginUser(email,password);
  res.status(httpStatus.OK).json({
    success: true,
    message: "Login successful",
    data: result,
  });
})

const createStaff = catchAsync(async (req, res) => {
  const result = await StaffServices.createStaffInDB(req.body);
  res.status(httpStatus.OK).json({
    success: true,
    message: "Staff created successfully",
    data: result,
  });
});

const getSingleStaff = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await StaffServices.getSingleStaffFromDB(id as string);
  res.status(httpStatus.OK).json({
    success: true,
    message: "Staff fetched successfully",
    data: result,
  });
});

const updateStaff = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await StaffServices.updateStaffInDB(id as string, req.body);
  res.status(httpStatus.OK).json({
    success: true,
    message: "Staff updated successfully",
    data: result,
  });
});

const deleteStaff = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await StaffServices.deleteStaffFromDB(id as string);
  res.status(httpStatus.OK).json({
    success: true,
    message: "Staff deleted successfully",
    data: result,
  });
});

export const StaffController = {
  getStaff,
  createStaff,
  getSingleStaff,
  updateStaff,
  deleteStaff,
  login,
};
