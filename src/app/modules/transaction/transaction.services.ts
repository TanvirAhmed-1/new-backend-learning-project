import prisma from "../../utils/prisma";
import { ITopupTransactionRequest } from "./transaction.interface";

const getTransactionsFromDB = async (query: Record<string, any>) => {
  const {
    page = 1,
    limit = 20,
    type,
    userId,
    cardId,
    staffId,
    organizationId,
    fromDate,
    toDate,
    orderBy = "createdAt",
    sortOrder = "desc",
  } = query;

  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  // 🔹 WHERE FILTER
  const where: any = {};

  if (organizationId) where.organizationId = organizationId;

  if (type) where.type = type;
  if (userId) where.userId = userId;
  if (cardId) where.cardId = cardId;
  if (staffId) where.staffId = staffId;

  // date filter (optional but powerful)
  if (fromDate || toDate) {
    where.createdAt = {};
    if (fromDate) where.createdAt.gte = new Date(fromDate);
    if (toDate) where.createdAt.lte = new Date(toDate);
  }

  // 🔹 QUERY
  const data = await prisma.transaction.findMany({
    where,
    skip,
    take,
    orderBy: {
      [orderBy]: sortOrder,
    },
    include: {
      user: true,
      card: true,
      staff: true,
      service: true,
      counter: true,
    },
  });

  // 🔥 CLEAN UI RESPONSE (IMPORTANT)
  const result = data.map((t: any) => ({
    id: t.id,

    type: t.type,
    amount: Number(t.amount),
    quantity: t.quantity,

    balanceBefore: Number(t.balanceBefore),
    balanceAfter: Number(t.balanceAfter),

    createdAt: t.createdAt,

    // 🔹 UI FRIENDLY RELATIONS
    user: t.user
      ? {
        id: t.user.id,
        name: t.user.name,
        phone: t.user.phone,
      }
      : null,

    card: t.card
      ? {
        id: t.card.id,
        code: t.card.cardCode,
        type: t.card.type,
      }
      : null,

    staff: t.staff
      ? {
        id: t.staff.id,
        name: t.staff.name,
      }
      : null,

    service: t.service
      ? {
        id: t.service.id,
        name: t.service.name,
      }
      : null,

    counter: t.counter
      ? {
        id: t.counter.id,
        name: t.counter.name,
      }
      : null,
  }));

  const total = await prisma.transaction.count({ where });

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

const getCounterWiseSalesFormDB = async (query: any) => {
  const {
    fromDate,
    toDate,
    organizationId,
    orderBy = "createdAt",
    sortOrder = "desc",
    page = 1,
    limit = 20,
  } = query;

  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  const where: any = {};

  if (organizationId) where.organizationId = organizationId;

  if (fromDate || toDate) {
    where.createdAt = {};
    if (fromDate) where.createdAt.gte = new Date(fromDate);
    if (toDate) where.createdAt.lte = new Date(toDate);
  }

  const data = await prisma.transaction.findMany({
    where,
    skip,
    take,
    orderBy: {
      [orderBy]: sortOrder,
    },
    include: {
      counter: true,
    },
  });

  const grouped: Record<string, any> = {};

  data.forEach((t: any) => {
    const key = t.counterId || "GLOBAL";

    if (!grouped[key]) {
      grouped[key] = {
        counter: t.counter
          ? { id: t.counter.id, name: t.counter.name }
          : { id: "GLOBAL", name: "Global" },

        totalTransactions: 0,
        totalTopup: 0,
        totalRefund: 0,
        totalUsage: 0,
      };
    }

    grouped[key].totalTransactions += 1;

    const amount = Number(t.amount);

    if (t.type === "TOPUP") grouped[key].totalTopup += amount;
    if (t.type === "REFUND") grouped[key].totalRefund += amount;
    if (t.type === "USAGE") grouped[key].totalUsage += amount;
  });

  const result = Object.values(grouped).map((item: any) => ({
    ...item,
    netAmount: item.totalTopup - item.totalRefund - item.totalUsage,
  }));

  const total = await prisma.transaction.count({ where });

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

const getDailyLedgerFormDB = async (query: Record<string, any>) => {
  const {
    fromDate,
    toDate,
    organizationId,
    orderBy = "createdAt",
    sortOrder = "desc",
    page = 1,
    limit = 20,
  } = query;

  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  // 🔥 1. Date Filter
  const where: any = {};

  if (organizationId) where.organizationId = organizationId;

  if (fromDate || toDate) {
    where.createdAt = {};

    if (fromDate) {
      where.createdAt.gte = new Date(fromDate);
    }

    if (toDate) {
      // end of day fix
      const endDate = new Date(toDate);
      endDate.setHours(23, 59, 59, 999);
      where.createdAt.lte = endDate;
    }
  }

  // 🔥 2. Query with filter + order
  const data = await prisma.transaction.findMany({
    where,
    orderBy: {
      [orderBy]: sortOrder,
    },
  });

  // 🔥 3. Group by date
  const grouped: Record<string, any> = {};

  data.forEach((t: any) => {
    //  timezone-safe date
    const date = t.createdAt.toISOString().split("T")[0];

    if (!grouped[date]) {
      grouped[date] = {
        date,
        totalTopup: 0,
        totalUsage: 0,
        totalRefund: 0,
      };
    }

    const amount = Number(t.amount);

    if (t.type === "TOPUP") grouped[date].totalTopup += amount;
    if (t.type === "USAGE") grouped[date].totalUsage += amount;
    if (t.type === "REFUND") grouped[date].totalRefund += amount;
  });

  // 🔥 4. Running balance calculation
  let runningBalance = 0;

  const ledgerArray = Object.values(grouped).map((day: any) => {
    const openingBalance = runningBalance;

    const closingBalance =
      openingBalance +
      day.totalTopup -
      day.totalUsage -
      day.totalRefund;

    runningBalance = closingBalance;

    return {
      ...day,
      openingBalance,
      closingBalance,
    };
  });

  // 🔥 5. Sorting AFTER grouping (IMPORTANT)
  const sorted = ledgerArray.sort((a: any, b: any) => {
    if (sortOrder === "asc") {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    }
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  // 🔥 6. Pagination AFTER grouping
  const paginated = sorted.slice(skip, skip + take);

  return {
    meta: {
      page: Number(page),
      limit: Number(limit),
      total: sorted.length,
      totalPage: Math.ceil(sorted.length / Number(limit)),
    },
    data: paginated,
  };
};

const topupTransactionFromDB = async (payload: ITopupTransactionRequest) => {
  const { userId, cardUid, amount, staffId, counterId } = payload;

  if (!userId) throw new Error("userId is required");
  if (!cardUid) throw new Error("cardUid is required");
  if (!amount || amount <= 0) throw new Error("Amount must be greater than zero");

  return await prisma.$transaction(async (tx: any) => {
    // 1. Get the card & user
    const card = await tx.card.findUnique({
      where: { cardUid },
      include: { user: true },
    });

    if (!card) throw new Error("Card not found");
    if (card.status !== "ACTIVE") throw new Error("Card is not active");

    const user = card.user;
    if (!user) throw new Error("No user assigned to this card");
    if (user.id !== userId) throw new Error("This card is not assigned to the provided user");
    if (user.status !== "ACTIVE") throw new Error("User is not active");

    const balanceBefore = Number(user.balance);
    const balanceAfter = balanceBefore + amount;

    // 2. Update user balance
    const updatedUser = await tx.user.update({
      where: { id: user.id },
      data: {
        balance: balanceAfter,
      },
    });

    // 3. Create transaction record
    const transaction = await tx.transaction.create({
      data: {
        userId: user.id,
        cardId: card.id,
        eventId: user.activeEventId ?? null,
        organizationId: payload.organizationId || null,
        staffId: staffId ?? null,
        counterId: counterId ?? null,
        type: "TOPUP",
        amount: amount,
        quantity: 1,
        balanceBefore,
        balanceAfter,
      },
    });

    return {
      transaction,
      updatedBalance: balanceAfter,
    };
  });
};

export const TransactionServices = {
  getTransactionsFromDB,
  getCounterWiseSalesFormDB,
  getDailyLedgerFormDB,
  topupTransactionFromDB,
};
