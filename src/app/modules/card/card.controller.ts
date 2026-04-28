import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import { CardServices } from "./card.services";

const createCard = catchAsync(async (req, res) => {
  const result = await CardServices.createCardInDB(req.body);

  res.status(httpStatus.CREATED).json({
    success: true,
    message: "Card created successfully",
    data: result,
  });
});

const getAllCards = catchAsync(async (req, res) => {
  const result = await CardServices.getAllCardFormDB(req.query);
  res.status(httpStatus.OK).json({
    success: true,
    message: "Cards fetched successfully",
    data: result,
  });
});

const getSingleCardDetails = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await CardServices.getSingleCardDetailsFromDB(id as string);
  res.status(httpStatus.OK).json({
    success: true,
    message: "this Card Transaction fetched successfully",
    data: result,
  });
});

const getVirtualInactiveCard = catchAsync(async (req, res) => {
  const result = await CardServices.getVirtualInactiveCardFromDB();
  res.status(httpStatus.OK).json({
    success: true,
    message: "the Virtual Card fetched successfully",
    data: result,
  });
});
const deleteCard = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await CardServices.deleteCardFromDB(id as string);
  res.status(httpStatus.OK).json({
    success: true,
    message: "Card deleted successfully",
    data: result,
  });
});

export const CardController = {
  createCard,
  getAllCards,
  getSingleCardDetails,
  getVirtualInactiveCard,
  deleteCard,
};
