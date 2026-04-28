import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import { UserServices } from "./user.services";

const createUser = catchAsync(async (req, res) => {
  const result = await UserServices.createUserWithCard(req.body);

  res.status(httpStatus.CREATED).json({
    success: true,
    message: "User created successfully",
    data: result,
  });
});

const getAllUsers = catchAsync(async (req, res) => {
  const result = await UserServices.getAllUsersFromDB(req.query);

  res.status(httpStatus.OK).json({
    success: true,
    message: "Users fetched successfully",
    data: result,
  });
});

const getSingleUser = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await UserServices.getSingleUserFromDB(id as string);

  res.status(httpStatus.OK).json({
    success: true,
    message: "User fetched successfully",
    data: result,
  });
});

const updateUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await UserServices.updateUserInDB(id as string, req.body);

  res.status(httpStatus.OK).json({
    success: true,
    message: "User updated successfully",
    data: result,
  });
});

const deleteUser = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await UserServices.deleteUserFromDB(id as string);

  res.status(httpStatus.OK).json({
    success: true,
    message: "User deleted successfully",
    data: result,
  });
});

const getNewCardIssuedUser = catchAsync(async (req, res) => {
  const result = await UserServices.getNewCardIssuedUserFormDB(req.query);

  res.status(httpStatus.OK).json({
    success: true,
    message: "User fetched successfully",
    data: result,
  });
});

const checkoutUser = catchAsync(async (req, res) => {
  const { userId: id, amount } = req.body;
  const result = await UserServices.checkoutUserFormDB(id as string, amount);

  res.status(httpStatus.OK).json({
    success: true,
    message: "User checked out successfully",
    data: result,
  });
});

const applyUserPenalty = catchAsync(async (req, res) => {
  const { userId, organizationId } = req.body;

  const result = await UserServices.applyUserPenaltyFormDB(
    userId,
    organizationId
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
