import { pick } from "../../utils/pick";
import prisma from "../../utils/prisma";
import { ICounterRequest } from "./counter.interface";

const createCounterInDB = async (data: ICounterRequest) => {
  const { name, organizationId } = data;

  if (!organizationId) {
    throw new Error("Organization ID is required");
  }

  const isExist = await prisma.counter.findUnique({ where: { name } });
  if (isExist) {
    throw new Error("Counter already exists");
  }
  const result = await prisma.counter.create({
    data: {
      name: data.name,
      isActive: data.isActive,
      organizationId: organizationId,
    },
  });
  return result;
};

const getAllCountersFromDB = async (
  queryParams: Record<string, any>,
  organizationId: string
) => {
  const {
    name,
    status,
    page = 1,
    limit = 30,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = queryParams;

  if (!organizationId) {
    throw new Error("Organization ID is required");
  }

  const skip = (Number(page) - 1) * Number(limit);

  const whereCondition: any = {
    organizationId, // MAIN FILTER
  };

  // Search by name
  if (name) {
    whereCondition.name = {
      contains: name,
      mode: "insensitive", // PostgreSQL case-insensitive
    };
  }

  // Filter by status
  if (status !== undefined && status !== "") {
    whereCondition.isActive =
      status === "true" || status === true;
  }

  const counters = await prisma.counter.findMany({
    where: whereCondition,
    skip,
    take: Number(limit),

    orderBy: {
      [sortBy]: sortOrder,
    },

    include: {
      service: true,
      staff: true,

      _count: {
        select: {
          service: true,
          staff: true,
        },
      },
    },
  });

  const total = await prisma.counter.count({
    where: whereCondition,
  });

  return {
    meta: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPage: Math.ceil(total / Number(limit)),
    },

    data: counters,
  };
};

const getSingleCounterFromDB = async (id: string) => {
  const result = await prisma.counter.findUnique({
    where: { id },
    include: { staff: true },
  });
  return result;
};

const updateCounterInDB = async (
  id: string,
  organizationId: string,
  payload: Partial<ICounterRequest>
) => {
  const isExist = await prisma.counter.findFirst({
    where: {
      id,
      organizationId,
    },
  });

  if (!isExist) {
    throw new Error("Counter not found or you don't have access to it");
  }

  const updateData = pick(payload, ["name", "isActive"]);

  if (updateData.name) {
    const isNameExist = await prisma.counter.findFirst({
      where: {
        name: updateData.name,
        organizationId,
        NOT: {
          id,
        },
      },
    });

    if (isNameExist) {
      throw new Error("Counter name already exists in your organization");
    }
  }

  // ৪. ডাটাবেজ আপডেট
  const result = await prisma.counter.update({
    where: {
      id,
    },
    data: updateData,
  });

  return result;
};

const deleteCounterFromDB = async (
  id: string,
  organizationId: string
) => {

  if (!organizationId) {
    throw new Error("Organization ID is required");
  }
  const isExist = await prisma.counter.findFirst({
    where: {
      id,
      organizationId,
    },

    include: {
      service: true,
      staff: true,
    },
  });

  if (!isExist) {
    throw new Error("Counter not found");
  }

  // Prevent delete if related data exists
  if (isExist.service.length > 0 || isExist.staff.length > 0) {
    throw new Error(
      "Cannot delete counter because services or staffs are assigned"
    );
  }

  const result = await prisma.counter.delete({
    where: {
      id,
    },
  });

  return result;
};

export const CounterServices = {
  createCounterInDB,
  getAllCountersFromDB,
  getSingleCounterFromDB,
  updateCounterInDB,
  deleteCounterFromDB,
};
