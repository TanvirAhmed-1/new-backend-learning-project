import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import { UserServices } from "./user.services";

const createUser = catchAsync(async (req, res) => {
  const data = req.body;
  const organizationId = req.user?.organizationId;
  const payload = { ...data, organizationId };
  const result = await UserServices.createUserWithCard(payload);

  res.status(httpStatus.CREATED).json({
    success: true,
    message: "User created successfully",
    data: result,
  });
});

const getAllUsers = catchAsync(async (req, res) => {
  const query = req.query;
  const organizationId = req.user?.organizationId;
  const result = await UserServices.getAllUsersFromDB(query, organizationId as string);

  res.status(httpStatus.OK).json({
    success: true,
    message: "Users fetched successfully",
    data: result,
  });
});

const getSingleUser = catchAsync(async (req, res) => {
  const { id } = req.params;
  const organizationId = req.user?.organizationId;
  const result = await UserServices.getSingleUserFromDB(id as string, organizationId as string);

  res.status(httpStatus.OK).json({
    success: true,
    message: "User fetched successfully",
    data: result,
  });
});

const updateUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const organizationId = req.user?.organizationId;
  const result = await UserServices.updateUserInDB(
    id as string,
    organizationId as string,
    req.body
  );

  res.status(httpStatus.OK).json({
    success: true,
    message: "User updated successfully",
    data: result,
  });
});

const deleteUser = catchAsync(async (req, res) => {
  const { id } = req.params;
  const organizationId = req.user?.organizationId;
  const result = await UserServices.deleteUserFromDB(id as string, organizationId as string);

  res.status(httpStatus.OK).json({
    success: true,
    message: "User deleted successfully",
    data: result,
  });
});

const getNewCardIssuedUser = catchAsync(async (req, res) => {
  const query = req.query;
  const organizationId = req.user?.organizationId;
  const result = await UserServices.getNewCardIssuedUserFormDB(query, organizationId as string);

  res.status(httpStatus.OK).json({
    success: true,
    message: "User fetched successfully",
    data: result,
  });
});

const checkoutUser = catchAsync(async (req, res) => {
  const { userId: id, amount } = req.body;
  const organizationId = req.user?.organizationId;
  const result = await UserServices.checkoutUserFormDB(id as string, amount, organizationId as string);

  res.status(httpStatus.OK).json({
    success: true,
    message: "User checked out successfully",
    data: result,
  });
});

const applyUserPenalty = catchAsync(async (req, res) => {
  const { userId } = req.body;
  const organizationId = req.user?.organizationId;

  const result = await UserServices.applyUserPenaltyFormDB(
    userId,
    organizationId as string
  );

  res.status(httpStatus.OK).json({
    success: true,
    message: "Penalty applied successfully",
    data: result,
  });
});

export const UserController = {
  createUser,
  getAllUsers,
  getSingleUser,
  updateUser,
  deleteUser,
  getNewCardIssuedUser,
  checkoutUser,
  applyUserPenalty,
};
