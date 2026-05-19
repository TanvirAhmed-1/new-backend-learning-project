import prisma from "../../utils/prisma";
import { generateCardCode } from "../user/user.utils";
import { ICreateCard } from "./card.interface";


const createCardInDB = async (data: ICreateCard, user?: any) => {
  const { type, cardUid: inputCardUid, organizationId } = data;
  if (!organizationId) {
    throw new Error("Organization ID is required");
  }

  if (type !== "NFC" && type !== "RFID" && type !== "VIRTUAL") {
    throw new Error("Invalid card type");
  }

  if (type === "NFC" || type === "RFID") {
    if (!inputCardUid) {
      throw new Error("Card UID is required");
    }
  }

  // check organization
  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
  });
  if (!organization) {
    throw new Error("Organization not found");
  }

  let cardUid: string | null = null;
  const cardCode = generateCardCode();

  // NFC/RFID Check duplicates
  if (type === "NFC" || type === "RFID") {
    if (!inputCardUid) {
      throw new Error("Card UID is required for NFC/RFID");
    }

    const isExist = await prisma.card.findUnique({
      where: { cardUid: inputCardUid },
    });

    if (isExist) {
      throw new Error("Card UID already exists");
    }

    cardUid = inputCardUid;
  }

  const result = await prisma.card.create({
    data: {
      type,
      cardUid,
      cardCode,
      status: "INACTIVE",
      organizationId,
    },
  });

  return result;
};

const getAllCardFormDB = async (
  queryParams: Record<string, any>,
  organizationId: string
) => {
  const {
    cardUid,
    cardCode,
    status,
    fromDate,
    toDate,
    page = 1,
    limit = 20,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = queryParams;

  if (!organizationId) {
    throw new Error("Organization ID is required");
  }

  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  const whereCondition: any = {
    organizationId,
  };

  // 🔹 Filtering Logic
  if (cardUid) {
    whereCondition.cardUid = {
      contains: cardUid,
    };
  }

  if (cardCode) {
    whereCondition.cardCode = {
      contains: cardCode,
    };
  }

  if (status) {
    whereCondition.status = status;
  }

  // 🔹 Date filter
  if (fromDate || toDate) {
    whereCondition.createdAt = {};

    if (fromDate) {
      const start = new Date(fromDate);
      start.setHours(0, 0, 0, 0);
      whereCondition.createdAt.gte = start;
    }

    if (toDate) {
      const end = new Date(toDate);
      end.setHours(23, 59, 59, 999);
      whereCondition.createdAt.lte = end;
    }
  }

  // 🔹 Querying Database
  const data = await prisma.card.findMany({
    where: whereCondition,
    skip,
    take,
    orderBy: {
      [sortBy]: sortOrder,
    },
    select: {
      id: true,
      cardUid: true,
      cardCode: true,
      type: true,
      status: true,
      organizationId: true,
      createdAt: true,
      user: {
        select: {
          id: true,
          name: true,
          phone: true,
          status: true,
          balance: true,
        },
      },
    },
  });

  // 🔹 Total count for pagination meta
  const total = await prisma.card.count({
    where: whereCondition,
  });

  return {
    meta: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPage: Math.ceil(total / Number(limit)),
    },
    data: data,
  };
};

const getSingleCardDetailsFromDB = async (id: string) => {
  const isExist = await prisma.card.findUnique({ where: { id } });

  if (!isExist) {
    throw new Error("Card not found");
  }

  const result = await prisma.card.findUnique({
    where: { id },
    include: {
      transactions: {
        include: {
          user: true,
          service: true,
          staff: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  return result;
};

const getVirtualInactiveCardFromDB = async (query: Record<string, any> = {}) => {
  const { organizationId } = query;
  const where: any = { type: "VIRTUAL", status: "INACTIVE" };
  if (organizationId) {
    where.organizationId = organizationId;
  }
  const result = await prisma.card.findFirst({
    where,
  });
  return result;
};

const deleteCardFromDB = async (id: string, user?: any) => {
  const isExist = await prisma.card.findUnique({ where: { id } });
  if (!isExist) {
    throw new Error("Card not found");
  }

  // Enforce SaaS multi-tenancy check
  if (user?.role !== "SUPER_ADMIN") {
    if (!user?.organizationId || isExist.organizationId !== user?.organizationId) {
      throw new Error("Forbidden Access! You do not have permission to delete this card.");
    }
  }

  if (isExist.status === "ACTIVE") {
    throw new Error("Cannot delete an active card");
  }
  const hasTransaction = await prisma.transaction.findFirst({
    where: { cardId: id },
  });

  if (hasTransaction) {
    throw new Error("Card has transactions, cannot delete");
  }

  const result = await prisma.card.delete({ where: { id } });
  return result;
};

export const CardServices = {
  createCardInDB,
  getAllCardFormDB,
  getVirtualInactiveCardFromDB,
  deleteCardFromDB,
  getSingleCardDetailsFromDB,
};
