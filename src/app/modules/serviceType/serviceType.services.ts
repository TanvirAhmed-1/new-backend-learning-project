import prisma from "../../utils/prisma";
import { IServiceTypeRequest } from "./serviceType.interface";

const createServiceTypeInDB = async (data: IServiceTypeRequest) => {
  const isExist = await prisma.serviceType.findUnique({
    where: { name: data.name },
  });

  if (isExist) {
    throw new Error("Service type already exists");
  }

  const result = await prisma.serviceType.create({
    data: {
      name: data.name,
      organizationId: data.organizationId || null,
    },
  });

  return result;
};

const getAllServiceTypesFromDB = async (queryParams: Record<string, any>) => {
  const {
    name,
    organizationId,
    page = 1,
    limit = 20,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = queryParams;

  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  const whereCondition: any = {};

  if (name) {
    whereCondition.name = {
      contains: name,
    };
  }

  if (organizationId) {
    whereCondition.organizationId = organizationId;
  }

  //
  const data = await prisma.serviceType.findMany({
    where: whereCondition,
    skip,
    take,
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
  data: Partial<IServiceTypeRequest>
) => {
  const isExist = await prisma.serviceType.findUnique({
    where: { id },
  });

  if (!isExist) {
    throw new Error("Service type not found");
  }

  // optional duplicate check
  if (data.name) {
    const duplicate = await prisma.serviceType.findUnique({
      where: { name: data.name },
    });

    if (duplicate && duplicate.id !== id) {
      throw new Error("Service type name already exists");
    }
  }

  const result = await prisma.serviceType.update({
    where: { id },
    data,
  });

  return result;
};

const deleteServiceTypeFromDB = async (id: string) => {
  const isExist = await prisma.serviceType.findUnique({
    where: { id },
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
