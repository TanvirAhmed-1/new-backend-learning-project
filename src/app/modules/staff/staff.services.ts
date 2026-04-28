import bcrypt from "bcrypt";
import prisma from "../../utils/prisma";
import { IStaff } from "./staff.interface";
import { createToken } from "../../utils/createToken ";

const getStaffFromDB = async (queryParams: Record<string, any>) => {
  const {
    name,
    email,
    phone,
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

  if (email) {
    whereCondition.email = {
      contains: email,
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
    take,
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
  const { email, phone, password, ...rest } = data;
  const phoneExist = await prisma.staff.findUnique({ where: { phone } });
  if (phoneExist) {
    throw new Error("Phone number already exists");
  }
  const emailExist = await prisma.staff.findUnique({ where: { email } });
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
    },
  });
  return result;
};
const updateStaffInDB = async (id: string, data: Partial<IStaff>) => {
  const isExist = await prisma.staff.findUnique({ where: { id } });
  if (!isExist) {
    throw new Error("Staff not found");
  }
  const result = await prisma.staff.update({
    where: { id },
    data,
  });
  return result;
};
const deleteStaffFromDB = async (id: string) => {
  const isExist = await prisma.staff.findUnique({ where: { id } });
  if (!isExist) {
    throw new Error("Staff not found");
  }
  const result = await prisma.staff.delete({ where: { id } });
  return result;
};

export const loginUser = async (email: string, password: string) => {
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
