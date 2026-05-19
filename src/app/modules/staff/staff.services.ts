import bcrypt from "bcrypt";
import { pick } from "../../utils/pick";
import prisma from "../../utils/prisma";
import { IStaff } from "./staff.interface";
import { createToken } from "../../utils/createToken ";

const getStaffFromDB = async (
  queryParams: Record<string, any>,
  organizationId: string
) => {
  const {
    name,
    email,
    phone,
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

  if (email) {
    whereCondition.email = {
      contains: email,
      mode: "insensitive",
    };
  }

  if (phone) {
    whereCondition.phone = {
      contains: phone,
    };
  }

  // 🔹 Query
  const data = await prisma.staff.findMany({
    where: whereCondition,
    skip,
    take: Number(limit),
    orderBy: {
      [sortBy]: sortOrder,
    },
    include: {
      counter: true, //  include counter info
      _count: {
        select: {
          services: true,
          transactions: true,
        },
      },
    },
  });

  // 🔹 Clean response (remove password 🔥)
  const result = data.map((item) => ({
    id: item.id,
    name: item.name,
    email: item.email,
    phone: item.phone,
    role: item.role,
    password: item.password,
    isActive: item.isActive,
    counter: item.counter
      ? {
          id: item.counter.id,
          name: item.counter.name,
        }
      : null,
    totalServices: item._count.services,
    totalTransactions: item._count.transactions,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }));

  // 🔹 Total count
  const total = await prisma.staff.count({
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

const getSingleStaffFromDB = async (id: string) => {
  const isExist = await prisma.staff.findUnique({ where: { id } });
  if (!isExist) {
    throw new Error("Staff not found");
  }
  const result = await prisma.staff.findUnique({ where: { id } });
  return result;
};

const createStaffInDB = async (data: IStaff) => {
  const { email, phone, password, organizationId, ...rest } = data;

  if (!organizationId) {
    throw new Error("Organization ID is required");
  }

  const phoneExist = await prisma.staff.findFirst({
    where: {
      phone,
      organizationId,
    },
  });
  if (phoneExist) {
    throw new Error("Phone number already exists");
  }
  const emailExist = await prisma.staff.findFirst({
    where: {
      email,
      organizationId,
    },
  });
  if (emailExist) {
    throw new Error("Email already exists");
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const result = await prisma.staff.create({
    data: {
      ...rest,
      email,
      phone,
      password: hashedPassword,
      organizationId,
    },
  });
  return result;
};
const updateStaffInDB = async (
  id: string,
  organizationId: string,
  payload: Partial<IStaff>,
) => {
  if (!organizationId) {
    throw new Error("Organization ID is required");
  }

  const isExist = await prisma.staff.findFirst({
    where: {
      id,
      organizationId,
    },
  });

  if (!isExist) {
    throw new Error("Staff not found");
  }

  const updateData: any = pick(payload, [
    "name",
    "email",
    "phone",
    "isActive",
    "counterId",
  ]);

  if (payload.password) {
    updateData.password = await bcrypt.hash(payload.password, 10);
  }

  const result = await prisma.staff.update({
    where: { id },
    data: updateData,
  });
  return result;
};
const deleteStaffFromDB = async (id: string, organizationId: string) => {
  if (!organizationId) {
    throw new Error("Organization ID is required");
  }

  const isExist = await prisma.staff.findFirst({
    where: {
      id,
      organizationId,
    },
  });

  if (!isExist) {
    throw new Error("Staff not found");
  }

  const result = await prisma.staff.delete({ where: { id } });
  return result;
};

 const loginUser = async (email: string, password: string) => {
  // 1. find user
  const user = await prisma.staff.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // 2. password check
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error("Invalid credentials");
  }
  const tokenPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
    organizationId: user.organizationId,
  };
  // 3. create token
  const token = createToken(tokenPayload);

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
    },
  };
};

export const StaffServices = {
  getStaffFromDB,
  getSingleStaffFromDB,
  createStaffInDB,
  deleteStaffFromDB,
  updateStaffInDB,
  loginUser,
};
