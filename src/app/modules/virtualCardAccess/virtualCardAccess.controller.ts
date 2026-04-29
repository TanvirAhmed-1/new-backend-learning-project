import { VirtualCardAccessServices } from "./virtualCardAccess.services";
import catchAsync from "../../utils/catchAsync";
import httpStatus from "http-status";

const sendSMS = catchAsync(async (req, res) => {
  const result = await VirtualCardAccessServices.sendVirtualCardSMS(
    req.params.id as string,
  );

  res.status(httpStatus.OK).json({
    success: true,
    message: "SMS sent successfully",
    data: result,
  });
});

const getVirtual = catchAsync(async (req, res) => {
  const result = await VirtualCardAccessServices.getVirtualFormBD();
  res.status(httpStatus.OK).json({
    success: true,
    message: "Virtual Card fetched successfully",
    data: result,
  });
});

export const VirtualCardAccessController = {
  sendSMS,
  getVirtual,
};
