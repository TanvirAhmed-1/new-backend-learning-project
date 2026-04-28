import prisma from "../../utils/prisma";
import { Prisma } from "@prisma/client";
import { ICreateUser, UpdateUserInput } from "./user.interface";
import { generateUniqueCardData, getToday, updateVisit } from "./user.utils";

const createUserWithCard = async (data: ICreateUser) => {
  const {
    phone,
    name,
    email,
    cardId,
    balance,
    pinHash,
    CardType,
    organizationId,
    eventId,
  } = data;

  return await prisma.$transaction(async (tx: any) => {
    if (organizationId) {
      const organization = await prisma.organization.findUnique({
        where: { id: organizationId },
      });
      if (!organization) {
        throw new Error("Organization not found");
      }
    }
    if (eventId) {
      const event = await prisma.event.findUnique({
        where: { id: eventId },
      });
      if (!event) {
        throw new Error("Event is  not found!");
      }
    }


    let card;

    // =========================
    // VIRTUAL CARD FLOW
    // =========================
    if (CardType === "VIRTUAL") {
      const { cardUid, cardCode } = await generateUniqueCardData(tx);

      card = await tx.card.create({
        data: {
          type: "VIRTUAL",
          cardUid,
          cardCode,
          status: "ACTIVE",
          organizationId: data.organizationId,
        },
      });
    }

    // =========================
    //  NFC / RFID FLOW
    // =========================
    else {
      if (!cardId) throw new Error("Card ID is required");

      card = await tx.card.findUnique({
        where: { cardUid: cardId },
      });

      if (!card) throw new Error("Card not found");
      if (card.status === "ACTIVE") throw new Error("Card already active");
    }

    // =========================
    // USER CHECK
    // =========================
    const existingUser = await tx.user.findUnique({
      where: { phone },
    });

    if (existingUser?.status === "ACTIVE")
      throw new Error("User already active In this Phone number");

    let user;
    const balanceDecimal = new (Prisma as any).Decimal(balance);

    // =========================
    // EXISTING USER → UPDATE
    // =========================
    if (existingUser) {
      user = await tx.user.update({
        where: { phone },
        data: {
          name,
          email,
          status: "ACTIVE",
          activeEventId: eventId ?? existingUser.activeEventId,
          balance: {
            increment: balanceDecimal,
          },
          pinHash: pinHash ?? existingUser.pinHash,
          isPinSet: Boolean(pinHash),

          userPresent: updateVisit(existingUser.userPresent ?? {}),

          previousName: [
            ...(Array.isArray(existingUser.previousName)
              ? existingUser.previousName
              : []),
            existingUser.name,
          ].filter(Boolean),

          previousEmail: [
            ...(Array.isArray(existingUser.previousEmail)
              ? existingUser.previousEmail
              : []),
            existingUser.email,
          ].filter(Boolean),
          previousEventId: eventId
            ? [
              ...(Array.isArray(existingUser.previousEventId)
                ? existingUser.previousEventId
                : []),
              eventId,
            ]
            : existingUser.previousEventId ?? [],
        },
      });
    }

    // =========================
    // NEW USER → CREATE
    // =========================
    else {
      user = await tx.user.create({
        data: {
          phone,
          name,
          email,
          status: "ACTIVE",
          balance: balanceDecimal,
          pinHash: pinHash ?? null,
          isPinSet: Boolean(pinHash),
          activeEventId: eventId ?? null,
          userPresent: {
            [getToday()]: 1,
          },

          previousName: [],
          previousEmail: [],
          previousEventId: eventId ? [eventId] : [],
        },
      });
    }

    // =========================
    // UPDATE CARD
    // =========================
    const updatedCard = await tx.card.update({
      where: { id: card.id },
      data: {
        currentUserId: user.id,
        status: "ACTIVE",
      },
    });

    // =========================
    // TRANSACTION
    // =========================
    if (balance > 0) {
      await tx.transaction.create({
        data: {
          userId: user.id,
          cardId: card.id,
          serviceId: null,
          type: "TOPUP",
          amount: balanceDecimal,
          quantity: 1,
          balanceBefore: user.balance,
          balanceAfter: new (Prisma as any).Decimal(
            Number(user.balance) + Number(balance)
          ),
        },
      });
    }

    return {
      user,
      card: updatedCard,
    };
  });
};

const getNewCardIssuedUserFormDB = async (query: Record<string, any>) => {
  const {
    type,
    phone,
    fromDate,
    toDate,
    orderBy = "updatedAt",
    sortOrder = "desc",
    page = 1,
    limit = 20,
  } = query;

  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  // 🔥 WHERE CONDITION
  const where: any = {};

  // 🔹 Phone filter (user)
  if (phone) {
    where.phone = {
      contains: phone,
    };
  }

  // 🔹 Date filter
  if (fromDate || toDate) {
    where.createdAt = {};
    if (fromDate) where.createdAt.gte = new Date(fromDate);
    if (toDate) where.createdAt.lte = new Date(toDate);
  }

  //  Card filter
  if (type) {
    where.cards = {
      some: {
        type: type,
      },
    };
  }

  // 🔹 QUERY
  const users = await prisma.user.findMany({
    where,
    skip,
    take,
    orderBy: {
      [orderBy]: sortOrder,
    },
    include: {
      cards: true,
      transactions: {
        take: 1,
        where: {
          type: "TOPUP",
        },
      },
    },
  });

  // 🔹 TOTAL COUNT
  const total = await prisma.user.count({ where });

  return {
    meta: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPage: Math.ceil(total / Number(limit)),
    },
    data: users,
  };
};

const getAllUsersFromDB = async (query: Record<string, any>) => {
  const {
    type,
    phone,
    status,
    fromDate,
    toDate,
    orderBy = "createdAt",
    sortOrder = "desc",
    page = 1,
    limit = 20,
  } = query;

  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  // 🔥 WHERE CONDITION
  const where: any = {};

  // 🔹 Phone filter (user)
  if (phone) {
    where.phone = {
      contains: phone,
    };
  }

  // 🔹 User type filter
  if (status) {
    where.status = status;
  }

  // 🔹 Date filter
  if (fromDate || toDate) {
    where.createdAt = {};

    if (fromDate) {
      const start = new Date(fromDate);
      start.setHours(0, 0, 0, 0); // Diner shuru
      where.createdAt.gte = start;
    }

    if (toDate) {
      const end = new Date(toDate);
      end.setHours(23, 59, 59, 999); // Diner shesh
      where.createdAt.lte = end;
    }
  }

  //  Card type filter
  if (type) {
    where.cards = {
      some: {
        type: type,
      },
    };
  }

  const data = await prisma.user.findMany({
    where,
    skip,
    take,
    orderBy: {
      [orderBy]: sortOrder,
    },
    include: {
      cards: true,
      transactions: {
        include: {
          service: {
            select: {
              name: true,
            }
          }
        }
      },
    },
  });

  // 🔹 TOTAL COUNT
  const total = await prisma.user.count({ where });

  return {
    meta: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPage: Math.ceil(total / Number(limit)),
    },
    data,
  };
};

const getSingleUserFromDB = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      cards: true,
      transactions: true,
    },
  });

  if (!user) throw new Error("User not found");

  return user;
};

const updateUserInDB = async (id: string, data: UpdateUserInput) => {
  const user = await prisma.user.findUnique({ where: { id } });

  if (!user) throw new Error("User not found");

  return await prisma.user.update({
    where: { id },
    data,
  });
};

const deleteUserFromDB = async (id: string) => {
  const user = await prisma.user.findUnique({ where: { id } });

  if (!user) throw new Error("User not found");

  return await prisma.user.delete({
    where: { id },
  });
};

const checkoutUserFormDB = async (id: string, amount: number) => {
  const userExists = await prisma.user.findUnique({ where: { id } });

  if (!userExists) {
    throw new Error("User not found");
  }

  return await prisma.$transaction(async (tx: any) => {
    // 1️ Find user with card + current balance
    const user = await tx.user.findUnique({
      where: { id },
      include: {
        cards: true,
      },
    });

    if (!user) throw new Error("User not found");

    const card = user.cards[0];
    if (!card) throw new Error("No card assigned to user");

    const currentBalance = Number(user.balance);

    // 2️ Balance validation
    // if (amount <= 0) {
    //   throw new Error(`Invalid amount: ${amount}`);
    // }

    // if (currentBalance <= 0) {
    //   throw new Error("Card has no balance");
    // }

    // STRICT RULE (your requirement)
    if (amount !== currentBalance) {
      throw new Error(
        `Checkout only allowed when amount equals full balance. Available: ${currentBalance}, Requested: ${amount}`
      );
    }

    const newBalance = currentBalance - amount;

    // 3️ Create TRANSACTION record (DEBIT)
    await tx.transaction.create({
      data: {
        userId: user.id,
        cardId: card.id,
        type: "REFUND",
        amount: amount,
        balanceBefore: currentBalance,
        balanceAfter: newBalance,
      },
    });

    // 4️ Update card (reset balance)
    await tx.card.update({
      where: { id: card.id },
      data: {
        status: "INACTIVE",
      },
    });

    // 5️ Update user (deactivate + reset pin)
    await tx.user.update({
      where: { id },
      data: {
        status: "INACTIVE",
        balance: 0,
        isPinSet: false,
        pinHash: null,
      },
    });

    return;
  });
};

const applyUserPenaltyFormDB = async (
  userId: string,
  organizationId: string
) => {
  return await prisma.$transaction(async (tx: any) => {
    // 1️⃣ Get user with card
    const user = await tx.user.findUnique({
      where: { id: userId },
      include: { cards: true },
    });

    if (!user) throw new Error("User not found");

    const card = user.cards[0];
    if (!card) throw new Error("No card assigned to user");

    // 2️⃣ Validate card type
    if (card.type !== "NFC" && card.type !== "RFID") {
      throw new Error("Penalty not applicable for this card type");
    }

    // 3️⃣ Get organization penalty fee
    const organization = await tx.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization) {
      throw new Error("Organization not found");
    }

    const penaltyAmount = Number(organization.cardDamageFee);
    const currentBalance = Number(user.balance);

    // 4️⃣ Validate balance
    if (currentBalance < penaltyAmount) {
      throw new Error(
        `Insufficient balance. Required: ${penaltyAmount}, Available: ${currentBalance}`
      );
    }

    const afterPenaltyBalance = currentBalance - penaltyAmount;

    // 5️⃣ PENALTY TRANSACTION
    await tx.transaction.create({
      data: {
        userId: user.id,
        cardId: card.id,
        type: "PENALTY",
        amount: penaltyAmount,
        balanceBefore: currentBalance,
        balanceAfter: afterPenaltyBalance,
      },
    });

    // 6️⃣ REFUND LOG (optional business logic)
    const refundAmount = afterPenaltyBalance;

    if (refundAmount > 0) {
      await tx.transaction.create({
        data: {
          userId: user.id,
          cardId: card.id,
          type: "REFUND",
          amount: refundAmount,
          balanceBefore: afterPenaltyBalance,
          balanceAfter: 0,
        },
      });
    }

    // 7️⃣ Update card → LOST + reset balance
    await tx.card.update({
      where: { id: card.id },
      data: {
        status: "LOST",
      },
    });

    // 8️⃣ Optional user status update
    await tx.user.update({
      where: { id: user.id },
      data: {
        balance: 0,
        status: "INACTIVE",
      },
    });

    return {
      success: true,
      message: "Penalty applied successfully",
      data: {
        penaltyAmount,
        refundAmount,
      },
    };
  });
};

export const UserServices = {
  createUserWithCard,
  getAllUsersFromDB,
  getSingleUserFromDB,
  updateUserInDB,
  deleteUserFromDB,
  getNewCardIssuedUserFormDB,
  checkoutUserFormDB,
  applyUserPenaltyFormDB,
};
