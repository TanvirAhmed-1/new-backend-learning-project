import prisma from "../../utils/prisma";
import { ICounterRequest } from "./counter.interface";

const createCounterInDB = async (data: ICounterRequest) => {
  const { name } = data;

  const isExist = await prisma.counter.findUnique({ where: { name } });
  if (isExist) {
    throw new Error("Counter already exists");
  }
  const result = await prisma.counter.create({
    data: {
      name: data.name,
      isActive: data.isActive,
      organizationId: data.organizationId || null,
    },
  });
  return result;
};

// const getAllCountersFromDB = async () => {
//   const counters = await prisma.counter.findMany({
//     include: {
//       service: true,
//     },
//   });

//   const globalServices = await prisma.service.findMany({
//     where: { counterId: null },
//   });

//   return {
//     counters,
//     globalServices: globalServices.map((s) => ({
//       ...s,
//       scope: "GLOBAL",
//     })),
//   };
// };

const getAllCountersFromDB = async (queryParams: Record<string, any>) => {
  const {
    name, 
    status, 
    organizationId,
    page = 1,
    limit = 20,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = queryParams;

  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  const andConditions: any[] = [];

  // ১. Name Search (Case-insensitive behavior in MySQL)
  if (name) {
    andConditions.push({
      name: {
        contains: name,
      },
    });
  }

  // ২. Status Filter (isActive)
  if (status !== undefined && status !== "") {
    andConditions.push({
      isActive: status === "true" || status === true,
    });
  }

  // ৩. Organization Filter
  if (organizationId) {
    andConditions.push({
      organizationId,
    });
  }

  const whereCondition = andConditions.length > 0 ? { AND: andConditions } : {};

  const counters = await prisma.counter.findMany({
    where: whereCondition,
    skip,
    take,
    orderBy: {
      [sortBy]: sortOrder,
    },
    include: {
      service: true,
      staff: true,
      _count: {
        select: { service: true, staff: true },
      },
    },
  });

  const globalServices = await prisma.service.findMany({
    where: {
      counterId: null,
      isActive: true,
      OR: organizationId ? [
        { organizationId },
        { organizationId: null }
      ] : undefined
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
    data: {
      counters,
      globalServices: globalServices.map((s) => ({
        ...s,
        scope: s.organizationId ? "ORGANIZATION" : "GLOBAL",
      })),
    },
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
  data: Partial<ICounterRequest>
) => {
  const isExist = await prisma.counter.findUnique({ where: { id } });
  if (!isExist) {
    throw new Error("Counter not found");
  }

  const result = await prisma.counter.update({
    where: { id },
    data,
  });
  return result;
};

const deleteCounterFromDB = async (id: string) => {
  const isExist = await prisma.counter.findUnique({ where: { id } });
  if (!isExist) {
    throw new Error("Counter not found");
  }

  const result = await prisma.counter.delete({
    where: { id },
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
