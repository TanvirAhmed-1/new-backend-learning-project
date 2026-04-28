import prisma from "../../utils/prisma";
import { IEventQuotaBulk, } from "./eventQuota.interface";



const createEventQuota = async (data: IEventQuotaBulk) => {
  const { eventId, services } = data;

  //  Event check
  const eventExists = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!eventExists) {
    throw new Error("Event not found");
  }

  //  Duplicate check (optimized)
  const existing = await prisma.eventQuota.findMany({
    where: {
      eventId,
      serviceId: {
        in: services.map((s) => s.serviceId),
      },
    },
  });

  if (existing.length > 0) {
    throw new Error("Some services already assigned to this event");
  }

  // Transaction use for multiple create + return
  const createdQuotas = await prisma.$transaction(
    services.map((service) =>
      prisma.eventQuota.create({
        data: {
          eventId,
          serviceId: service.serviceId,
          maxUsesPerPerson: service.maxUsesPerPerson,
        },
        include: {
          service: true,
        },
      })
    )
  );

  return createdQuotas;
};

const getAllEventQuota = async (query: any) => {
  const {
    page = 1,
    limit = 20,
    eventName,
    serviceName,
    status,
    toDate,
    fromDate,
    orderBy = "createdAt",
    sortOrder = "desc",
  } = query;

  const skip = (Number(page) - 1) * Number(limit);

  const where: any = {};

  // event filters
  if (eventName || status) {
    where.event = {};
    if (eventName) {
      where.event.name = {
        contains: eventName,
      };
    }
    if (status) {
      where.event.status = status;
    }
  }

  // service filters
  if (serviceName) {
    where.service = {
      name: {
        contains: serviceName,
      },
    };
  }

  // quota date 
  if (fromDate || toDate) {
    where.createdAt = {};
    if (fromDate) where.createdAt.gte = new Date(fromDate);
    if (toDate) where.createdAt.lte = new Date(toDate);
  }

  const data = await prisma.eventQuota.findMany({
    where,
    include: {
      event: true,
      service: true,
    },
    skip,
    take: Number(limit),
    orderBy: {
      [orderBy]: sortOrder,
    },
  });

  const total = await prisma.eventQuota.count({ where });

  return {
    meta: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPage: Math.ceil(total / Number(limit)),
    },
    data,
  };
};

const updateEventQuota = async (data: IEventQuotaBulk) => {
  const { eventId, services } = data;

  if (!services || !Array.isArray(services)) {
    throw new Error("Invalid services payload");
  }

  const eventExists = await prisma.event.findUnique({
    where: { id: eventId },
    select: { id: true },
  });

  if (!eventExists) {
    throw new Error("Event not found");
  }

  return prisma.$transaction(async (tx) => {
    await tx.eventQuota.deleteMany({
      where: { eventId },
    });

    await tx.eventQuota.createMany({
      data: services.map((s) => ({
        eventId,
        serviceId: s.serviceId,
        maxUsesPerPerson: s.maxUsesPerPerson,
      })),
    });

    return tx.eventQuota.findMany({
      where: { eventId },
      include: {
        event: true,
        service: true,
      },
    });
  });
};

const deleteEventQuota = async (id: string) => {
  const exists = await prisma.eventQuota.findUnique({
    where: { id },
  });

  if (!exists) throw new Error("EventQuota not found");

  return await prisma.eventQuota.delete({
    where: { id },
  });
};

export const EventQuotaServices = {
  createEventQuota,
  getAllEventQuota,
  updateEventQuota,
  deleteEventQuota,
};
