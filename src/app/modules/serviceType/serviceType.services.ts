import { pick } from "../../utils/pick";
import prisma from "../../utils/prisma";
import { IServiceTypeRequest } from "./serviceType.interface";

const createServiceTypeInDB = async (data: IServiceTypeRequest) => {
  const { name, organizationId } = data;

  if (!organizationId) {
    throw new Error("Organization ID is required");
  }

  const isExist = await prisma.serviceType.findFirst({
    where: {
      name,
      organizationId,
    },
  });

  if (isExist) {
    throw new Error("Service type already exists");
  }

  const result = await prisma.serviceType.create({
    data: {
      name,
      organizationId,
    },
  });

  return result;
};

const getAllServiceTypesFromDB = async (
  queryParams: Record<string, any>,
  organizationId: string
) => {
  const {
    name,
    page = 1,
    limit = 20,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = queryParams;

  if (!organizationId) {
    throw new Error("Organization ID is required");
  }

  const skip = (Number(page) - 1) * Number(limit);

  const whereCondition: any = {
    organizationId,
  };

  if (name) {
    whereCondition.name = {
      contains: name,
      mode: "insensitive",
    };
  }

  //
  const data = await prisma.serviceType.findMany({
    where: whereCondition,
    skip,
    take: Number(limit),
    orderBy: {
      [sortBy]: sortOrder,
    },
    include: {
      _count: {
        select: {
          service: true,
        },
      },
    },
  });

  const result = data.map((item) => ({
    id: item.id,
    name: item.name,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    totalServices: item._count.service,
  }));

  const total = await prisma.serviceType.count({
    where: whereCondition,
  });

  return {
    meta: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPage: Math.ceil(total / Number(limit)),
    },
    data: result,
  };
};

const getSingleServiceTypeFromDB = async (id: string) => {
  const result = await prisma.serviceType.findUnique({
    where: { id },
  });

  if (!result) {
    throw new Error("Service type not found");
  }

  return result;
};

const updateServiceTypeInDB = async (
  id: string,
  organizationId: string,
  payload: Partial<IServiceTypeRequest>,
) => {
  if (!organizationId) {
    throw new Error("Organization ID is required");
  }

  const isExist = await prisma.serviceType.findFirst({
    where: {
      id,
      organizationId,
    },
  });

  if (!isExist) {
    throw new Error("Service type not found");
  }

  const updateData = pick(payload, ["name"]);

  // optional duplicate check
  if (updateData.name) {
    const duplicate = await prisma.serviceType.findFirst({
      where: {
        name: {
          equals: updateData.name,
          mode: "insensitive",
        },
        organizationId,
      },
    });

    if (duplicate && duplicate.id !== id) {
      throw new Error("Service type name already exists");
    }
  }

  const result = await prisma.serviceType.update({
    where: { id },
    data: updateData,
  });

  return result;
};

const deleteServiceTypeFromDB = async (id: string, organizationId: string) => {
  if (!organizationId) {
    throw new Error("Organization ID is required");
  }

  const isExist = await prisma.serviceType.findFirst({
    where: {
      id,
      organizationId,
    },
  });

  if (!isExist) {
    throw new Error("Service type not found");
  }

  const result = await prisma.serviceType.delete({
    where: { id },
  });

  return result;
};

export const ServiceTypeServices = {
  createServiceTypeInDB,
  getAllServiceTypesFromDB,
  getSingleServiceTypeFromDB,
  updateServiceTypeInDB,
  deleteServiceTypeFromDB,
};
