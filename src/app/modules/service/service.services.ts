import { pick } from "../../utils/pick";
import prisma from "../../utils/prisma";
import { IServiceRequest } from "./service.interface";

const createServiceInDB = async (data: IServiceRequest) => {
  const { name, organizationId } = data;

  if (!organizationId) {
    throw new Error("Organization ID is required");
  }

  const isExist = await prisma.service.findUnique({
    where: { name },
  });

  if (isExist) {
    throw new Error("Service already exists");
  }

  const serviceType = await prisma.serviceType.findUnique({
    where: { id: data.serviceTypeId },
  });

  if (!serviceType) {
    throw new Error("Invalid service type Id!");
  }

  if (data.counterId) {
    const counter = await prisma.counter.findUnique({
      where: { id: data.counterId },
    });

    if (!counter) {
      throw new Error("Invalid counter");
    }
  }

  //  2. staff validation
  if (data.staffId) {
    const staff = await prisma.staff.findUnique({
      where: { id: data.staffId },
    });

    if (!staff) {
      throw new Error("Invalid staff");
    }
  }

  const result = await prisma.service.create({
    data: {
      name: data.name,
      price: data.price,
      image: data.image,
      description: data.description,
      serviceTypeId: data.serviceTypeId,
      counterId: data.counterId,
      staffId: data.staffId,
      organizationId: organizationId,
    },
  });

  return result;
};

const getServicesFromDB = async (
  queryParams: Record<string, any>,
  organizationId: string
) => {
  const {
    name,
    minPrice,
    maxPrice,
    counterId,
    status,
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

  // ২. Status Filter
  if (status !== undefined && status !== "") {
    whereCondition.isActive = status === "true" || status === true;
  }

  // ৩. Counter Filter
  if (counterId) {
    whereCondition.OR = [
      { counterId: counterId },
      { counterId: null }
    ];
  }

  // ৪. Price Range Filter
  if (minPrice || maxPrice) {
    whereCondition.price = {};
    if (minPrice) whereCondition.price.gte = Number(minPrice);
    if (maxPrice) whereCondition.price.lte = Number(maxPrice);
  }

  const data = await prisma.service.findMany({
    where: whereCondition,
    skip,
    take: Number(limit),
    orderBy: {
      [sortBy]: sortOrder,
    },
    include: {
      serviceType: {
        select: { name: true },
      },
      counter: {
        select: { name: true },
      },
    },
  });

  const total = await prisma.service.count({
    where: whereCondition,
  });

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
const getSingleServiceFromDB = async (id: string) => {
  const result = await prisma.service.findUnique({
    where: { id },
    include: {
      serviceType: true,
      counter: true,
      staff: true,
    },
  });

  if (!result) {
    throw new Error("Service not found");
  }

  return result;
};



const updateServiceInDB = async (
  id: string,
  organizationId: string,
  payload: Partial<IServiceRequest>
) => {
  if (!organizationId) {
    throw new Error("Organization ID is required");
  }

  const isExist = await prisma.service.findFirst({
    where: {
      id,
      organizationId,
    },
  });

  if (!isExist) {
    throw new Error("Service not found");
  }

  const updateData = pick(payload, [
    "name",
    "price",
    "description",
    "image",
    "counterId",
    "serviceTypeId",
    "staffId",
  ]);

  const result = await prisma.service.update({
    where: { id },
    data: updateData,
  });

  return result;
};

const deleteServiceFromDB = async (id: string, organizationId: string) => {
  if (!organizationId) {
    throw new Error("Organization ID is required");
  }

  const isExist = await prisma.service.findFirst({
    where: {
      id,
      organizationId,
    },
  });

  if (!isExist) {
    throw new Error("Service not found");
  }

  return await prisma.service.delete({
    where: { id },
  });
};

//service used
const useServiceFromDB = async (payload: {
  cardUid: string;
  serviceId: string;
  qty?: number;
}) => {
  const { cardUid, serviceId, qty = 1 } = payload;

  if (!cardUid) throw new Error("cardUid is required");
  if (!serviceId) throw new Error("serviceId is required");

  return await prisma.$transaction(async (tx: any) => {
    // =========================
    // 1. GET CARD + USER
    // =========================
    const card = await tx.card.findUnique({
      where: { cardUid: cardUid },
      include: { user: true },
    });

    if (!card) throw new Error("Card not found");

    const user = card.user;
    if (!user) throw new Error("No user assigned to this card");

    // =========================
    // 2. GET SERVICE
    // =========================
    const service = await tx.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) throw new Error("Service not found");

    const price = Number(service.price) * qty;

    let isFree = false;

    // =========================
    // 3. EVENT CHECK (AUTO)
    // =========================
    if (user.activeEventId) {
      const event = await tx.event.findUnique({
        where: { id: user.activeEventId },
      });

      if (event && event.status === "ACTIVE") {
        const quota = await tx.eventQuota.findUnique({
          where: {
            eventId_serviceId: {
              eventId: event.id,
              serviceId,
            },
          },
        });

        if (quota) {
          const usedCount = await tx.transaction.count({
            where: {
              userId: user.id,
              serviceId,
              eventId: event.id,
            },
          });

          if (usedCount < quota.maxUsesPerPerson) {
            isFree = true;
          }
        }
      }
    }

    // =========================
    // 4. BALANCE CHECK
    // =========================
    const balanceBefore = Number(user.balance);

    // 🔥 CUSTOM ERROR LOGIC
    if (!isFree && balanceBefore < price) {
      if (user.activeEventId) {
        throw new Error("Free quota ended. Please recharge balance");
      } else {
        throw new Error("Insufficient balance");
      }
    }

    const balanceAfter = isFree ? balanceBefore : balanceBefore - price;

    // =========================
    // 5. UPDATE USER BALANCE
    // =========================
    await tx.user.update({
      where: { id: user.id },
      data: {
        balance: balanceAfter,
      },
    });



    // =========================
    // 7. CREATE TRANSACTION
    // =========================
    return await tx.transaction.create({
      data: {
        userId: user.id,
        cardId: card.id,
        serviceId,
        eventId: user.activeEventId ?? null,
        organizationId: service.organizationId ?? user.organizationId ?? null,
        type: "USAGE",
        amount: price,
        quantity: qty,
        balanceBefore,
        balanceAfter,
      },
    });
  });
};

export const ServiceServices = {
  createServiceInDB,
  getServicesFromDB,
  getSingleServiceFromDB,
  updateServiceInDB,
  deleteServiceFromDB,
  useServiceFromDB,
};
