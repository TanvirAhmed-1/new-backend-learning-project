import prisma from "../../utils/prisma";
import { IEventQuotaBulk, } from "./eventQuota.interface";



const createEventQuota = async (data: IEventQuotaBulk, organizationId: string) => {
  const { eventId, services } = data;

  if (!organizationId) {
    throw new Error("Organization ID is required");
  }

  //  Event check
  const eventExists = await prisma.event.findFirst({
    where: { id: eventId, organizationId },
  });

  if (!eventExists) {
    throw new Error("Event not found");
  }

  // Verify services belong to organization
  const serviceIds = services.map((s) => s.serviceId);
  const dbServices = await prisma.service.findMany({
    where: {
      id: { in: serviceIds },
      organizationId,
    },
  });
  if (dbServices.length !== serviceIds.length) {
    throw new Error("Some services do not belong to your organization");
  }

  //  Duplicate check (optimized)
  const existing = await prisma.eventQuota.findMany({
    where: {
      eventId,
      serviceId: {
        in: serviceIds,
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

const getAllEventQuota = async (query: any, organizationId: string) => {
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

  if (!organizationId) {
    throw new Error("Organization ID is required");
  }

  const skip = (Number(page) - 1) * Number(limit);

  const whereCondition: any = {
    event: {
      organizationId,
    },
  };

  // event filters
  if (eventName || status) {
    if (eventName) {
      whereCondition.event.name = {
        contains: eventName,
        mode: "insensitive",
      };
    }
    if (status) {
      whereCondition.event.status = status;
    }
  }

  // service filters
  if (serviceName) {
    whereCondition.service = {
      name: {
        contains: serviceName,
        mode: "insensitive",
      },
    };
  }

  // quota date 
  if (fromDate || toDate) {
    whereCondition.createdAt = {};
    if (fromDate) whereCondition.createdAt.gte = new Date(fromDate);
    if (toDate) whereCondition.createdAt.lte = new Date(toDate);
  }

  const data = await prisma.eventQuota.findMany({
    where: whereCondition,
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

  const total = await prisma.eventQuota.count({ where: whereCondition });

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

const updateEventQuota = async (data: IEventQuotaBulk, organizationId: string) => {
  const { eventId, services } = data;

  if (!organizationId) {
    throw new Error("Organization ID is required");
  }

  if (!services || !Array.isArray(services)) {
    throw new Error("Invalid services payload");
  }

  const eventExists = await prisma.event.findFirst({
    where: { id: eventId, organizationId },
    select: { id: true },
  });

  if (!eventExists) {
    throw new Error("Event not found");
  }

  // Verify services belong to organization
  const serviceIds = services.map((s) => s.serviceId);
  const dbServices = await prisma.service.findMany({
    where: {
      id: { in: serviceIds },
      organizationId,
    },
  });
  if (dbServices.length !== serviceIds.length) {
    throw new Error("Some services do not belong to your organization");
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

const deleteEventQuota = async (id: string, organizationId: string) => {
  if (!organizationId) {
    throw new Error("Organization ID is required");
  }

  const exists = await prisma.eventQuota.findFirst({
    where: {
      id,
      event: {
        organizationId,
      },
    },
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
