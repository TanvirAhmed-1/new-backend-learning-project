
import prisma from "../../utils/prisma";
import { IEvent } from "./event.interface";

const createEvent = async (data: IEvent) => {
  const exists = await prisma.event.findFirst({
    where: { name: data.name },
  });

  if (exists) {
    throw new Error("Event with this name already exists");
  }

  return await prisma.event.create({
    data: {
      name: data.name,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
    },
  });
};

const getAllEvent = async (queryParams: Record<string, any>) => {
  const {
    name,
    status,
    fromDate,
    toDate,
    page = 1,
    limit = 20,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = queryParams;

  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);
  const where: any = {};

  if (name) {
    where.name = {
      contains: name,
    };
  }

  if (status) {
    where.status = status;
  }

  if (fromDate || toDate) {
    where.createdAt = {};
    if (fromDate) where.createdAt.gte = new Date(fromDate);
    if (toDate) where.createdAt.lte = new Date(toDate);
  }
  const events = await prisma.event.findMany({
    where,
    skip,
    take,
    orderBy: { [sortBy]: sortOrder },
    include: {
      _count: {
        select: {
          activeUsers: true,
          transactions: true,
          eventQuotas: true,
        },
      },
    },
  });
  const total = await prisma.event.count({ where });

  return {
    meta: {
      page,
      limit,
      total: total,
      totalPage: Math.ceil(total / Number(limit)),
    },
    data: events,
  };
};

const getSingleEventUserFormDB = async (id: string) => {
  if (!id) throw new Error("Event ID is required");

  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      activeUsers: true,
      _count: {
        select: {
          activeUsers: true,
          transactions: true,
          eventQuotas: true,
        },
      },
    },
  });

  if (!event) throw new Error("Event not found");

  return event;
};

const getSingleEventQuotaFormDB = async (id: string) => {
  if (!id) throw new Error("Event ID is required");
  const isExist = await prisma.event.findUnique({
    where: { id },
  });

  if (!isExist) throw new Error("Event not found");

  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      eventQuotas: {
        select: {
          id: true,
          maxUsesPerPerson: true,
          service: true,
        },
      },
      _count: {
        select: {
          eventQuotas: true,
        },
      },
    },
  });

  return event;
};

const updateEvent = async (id: string, data: Partial<IEvent>) => {
  const exists = await prisma.event.findUnique({
    where: { id },
  });

  if (!exists) throw new Error("Event not found");

  return await prisma.event.update({
    where: { id },
    data,
  });
};

const deleteEvent = async (id: string) => {
  const exists = await prisma.event.findUnique({
    where: { id },
  });

  if (!exists) throw new Error("Event not found");

  return await prisma.event.delete({
    where: { id },
  });
};

const lockEvent = async (id: string) => {
  return await prisma.$transaction(async (tx: any) => {
    // 1. Lock Event
    const event = await tx.event.update({
      where: { id },
      data: {
        status: "LOCKED",
      },
    });

    // 2. INACTIVE all users of this event
    const users = await tx.user.findMany({
      where: {
        activeEventId: id,
      },
      select: {
        id: true,
      },
    });

    const userIds = users.map((u: any) => u.id);

    await tx.user.updateMany({
      where: {
        activeEventId: id,
      },
      data: {
        activeEventId: null,
        status: "INACTIVE",
      },
    });

    // 3. INACTIVE all cards of those users (IMPORTANT FIX)
    await tx.card.updateMany({
      where: {
        currentUserId: {
          in: userIds,
        },
      },
      data: {
        status: "INACTIVE",
      },
    });

    return event;
  });
};


const getAllEventUserFormDB = async (queryParams: Record<string, any>) => {
  const {
    phone,
    eventName,
    status,
    fromDate,
    toDate,
    page = 1,
    limit = 20,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = queryParams;

  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);
  const where: any = {};

  if (eventName) {
    where.name = {
      contains: eventName,
    };
  }

  if (status) {
    where.status = status;
  }

  if (fromDate || toDate) {
    where.createdAt = {};
    if (fromDate) where.createdAt.gte = new Date(fromDate);
    if (toDate) where.createdAt.lte = new Date(toDate);
  }

  if (phone) {
    where.activeUsers = {
      some: {
        phone: {
          contains: phone,
        },
      },
    };
  }

  const events = await prisma.event.findMany({
    where,
    skip,
    take,
    orderBy: { [sortBy]: sortOrder },
    include: {
      activeUsers: {
        where: phone ? { phone: { contains: phone } } : undefined,
        include: {
          cards: true,
        },
      },
      eventQuotas: true,
    },
  });

  const total = await prisma.event.count({ where });

  return {
    meta: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPage: Math.ceil(total / Number(limit)),
    },
    data: events,
  };
};

const deleteeventUserFormDB = async (eventId: string, userId: string) => {
  const isExist = await prisma.event.findUnique({
    where: { id: eventId },
  });
  if (!isExist) throw new Error("Event not found");

  const isUserExist = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!isUserExist) throw new Error("User not found");

  if (isUserExist.activeEventId !== eventId) {
    throw new Error("User is not active in this event");
  }

  return await prisma.$transaction(async (tx: any) => {
    const updatedUser = await tx.user.update({
      where: { id: userId },
      data: {
        activeEventId: null,
        status: "INACTIVE",
        pinHash: null,
        isPinSet: false,
        balance: 0,
      },
    });

    await tx.card.updateMany({
      where: { currentUserId: userId },
      data: {
        status: "INACTIVE",
      },
    });

    return updatedUser;
  });
};

const getEventAnalyticsFormDB = async (queryParams: Record<string, any>) => {
  const {
    name,
    status,
    fromDate,
    toDate,
    page = 1,
    limit = 20,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = queryParams;

  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  const where: any = {};

  if (name) {
    where.name = {
      contains: name,
    };
  }

  if (status) {
    where.status = status;
  }

  if (fromDate || toDate) {
    where.createdAt = {};
    if (fromDate) where.createdAt.gte = new Date(fromDate);
    if (toDate) where.createdAt.lte = new Date(toDate);
  }

  const events = await prisma.event.findMany({
    where,
    skip,
    take,
    orderBy: { [sortBy]: sortOrder },
    include: {
      activeUsers: {
        select: { id: true },
      },
      transactions: {
        select: { id: true, amount: true },
      },
      eventQuotas: {
        include: {
          service: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  const formatted = events.map((event) => {
    const activeUsersCount = event.activeUsers.length;

    const totalAllowedUses = event.eventQuotas.reduce((sum, q) => {
      return sum + q.maxUsesPerPerson * activeUsersCount;
    }, 0);

    const usedUses = event.eventQuotas.reduce((sum, q) => {
      return sum + q.usedCount;
    }, 0);

    return {
      id: event.id,
      name: event.name,
      status: event.status,
      startDate: event.startDate,
      endDate: event.endDate,

      activeUsersCount,
      totalTransactions: event.transactions.length,

      quota: {
        totalAllowedUses,
        usedUses,
        remainingUses: totalAllowedUses - usedUses,
      },
    };
  });

  const total = await prisma.event.count({ where });

  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / Number(limit)),
    },
    data: formatted,
  };
};


const getSingleEventAnalyticsFormDB = async (eventId: string, query: any) => {
  const { phone, status, cardUid, limit = 20, page = 1, sortBy = "createdAt", sortOrder = "desc" } = query;

  if (!eventId) throw new Error("Event ID is required");

  const existEvent = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      eventQuotas: {
        include: { service: true }
      },
      _count: {
        select: { activeUsers: true, transactions: true }
      }
    }
  });
  if (!existEvent) throw new Error("Event not found");

  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  const where: any = {
    activeEventId: eventId,
  };

  // 🔹 Phone filter
  if (phone) {
    where.phone = { contains: phone };
  }

  // 🔹 Status filter
  if (status) {
    where.status = status;
  }

  // 🔹 Card UID filter
  if (cardUid) {
    where.cards = {
      some: {
        cardUid: { contains: cardUid },
      },
    };
  }

  const users = await prisma.user.findMany({
    where,
    skip,
    take,
    orderBy: { [sortBy]: sortOrder },
    include: {
      cards: true,
      transactions: {
        orderBy: { createdAt: "desc" },
        include: {
          service: {
            select: {
              id: true,
              name: true,
            },
          },
          counter: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  const total = await prisma.user.count({ where });

  const formattedUsers = users.map((user) => {
    const servicesQuota = existEvent.eventQuotas.map((quota) => {
      const usedCount = user.transactions
        .filter((t) => t.type === "USAGE" && t.serviceId === quota.serviceId)
        .reduce((sum, t) => sum + Number(t.quantity || 1), 0);

      return {
        serviceId: quota.serviceId,
        serviceName: quota.service.name,
        totalAllowed: quota.maxUsesPerPerson,
        used: usedCount,
        remaining: Math.max(0, quota.maxUsesPerPerson - usedCount),
      };
    });

    return {
      id: user.id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      status: user.status,
      balance: Number(user.balance),
      cards: user.cards,
      transactions: user.transactions,
      servicesQuota,
    };
  });

  return {
    meta: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPage: Math.ceil(total / Number(limit)),
    },
    event: {
      id: existEvent.id,
      name: existEvent.name,
      startDate: existEvent.startDate,
      endDate: existEvent.endDate,
      status: existEvent.status
    },
    data: formattedUsers,
  };
};

export const EventService = {
  createEvent,
  getAllEvent,
  getSingleEventUserFormDB,
  getSingleEventQuotaFormDB,
  updateEvent,
  deleteEvent,
  lockEvent,
  getAllEventUserFormDB,
  deleteeventUserFormDB,
  getEventAnalyticsFormDB,
  getSingleEventAnalyticsFormDB,
};
