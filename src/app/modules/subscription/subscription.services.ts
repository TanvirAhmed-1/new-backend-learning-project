import prisma from "../../utils/prisma";
import { ICreateSubscriptionPlan, IBuySubscription } from "./subscription.interface";

const createPlanInDB = async (data: ICreateSubscriptionPlan) => {
  const isExist = await prisma.subscriptionPlan.findUnique({
    where: { name: data.name },
  });

  if (isExist) {
    throw new Error("Subscription plan with this name already exists");
  }

  const result = await prisma.subscriptionPlan.create({
    data: {
      name: data.name,
      description: data.description ?? null,
      price: data.price,
      billingCycle: data.billingCycle || "MONTHLY",
      maxUsers: data.maxUsers ?? 100,
      maxEvents: data.maxEvents ?? 10,
      maxStaffs: data.maxStaffs ?? 10,
    },
  });

  return result;
};

const getAllPlansFromDB = async () => {
  const result = await prisma.subscriptionPlan.findMany({
    where: { isActive: true },
    orderBy: { price: "asc" },
  });
  return result;
};

const buySubscriptionInDB = async (payload: IBuySubscription) => {
  const { organizationId, planId, paymentMethod, transactionId } = payload;

  if (!organizationId) {
    throw new Error("Organization ID is required");
  }

  // 1. Fetch Subscription Plan
  const plan = await prisma.subscriptionPlan.findUnique({
    where: { id: planId },
  });

  if (!plan) {
    throw new Error("Selected Subscription Plan not found");
  }

  // 2. Fetch Organization
  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
  });

  if (!organization) {
    throw new Error("Organization not found");
  }

  const now = new Date();

  return await prisma.$transaction(async (tx: any) => {
    // Check if subscription already exists
    const currentSubscription = await tx.subscription.findUnique({
      where: { organizationId },
    });

    let startDate = now;
    let endDate = new Date();

    // Determine the billing duration
    const daysToAdd = plan.billingCycle === "YEARLY" ? 365 : 30;

    if (currentSubscription) {
      // If active subscription exists and is not expired, accumulate/stack the period!
      const currentEndDate = new Date(currentSubscription.endDate);
      const baseDate = currentEndDate > now ? currentEndDate : now;

      startDate = currentSubscription.startDate;
      endDate = new Date(baseDate.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
    } else {
      endDate = new Date(now.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
    }

    // 3. Upsert Subscription
    const subscription = await tx.subscription.upsert({
      where: { organizationId },
      update: {
        planId,
        status: "ACTIVE",
        endDate,
      },
      create: {
        organizationId,
        planId,
        status: "ACTIVE",
        startDate,
        endDate,
      },
    });

    // 4. Log Payment history
    const payment = await tx.subscriptionPayment.create({
      data: {
        subscriptionId: subscription.id,
        amount: plan.price,
        status: "SUCCESS",
        paymentMethod,
        transactionId,
        billingPeriodStart: now,
        billingPeriodEnd: endDate,
      },
    });

    return {
      subscription,
      payment,
    };
  });
};

const getOrganizationSubscriptionFromDB = async (organizationId: string) => {
  if (!organizationId) {
    throw new Error("Organization ID is required");
  }

  const subscription = await prisma.subscription.findUnique({
    where: { organizationId },
    include: {
      plan: true,
      payments: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!subscription) {
    return {
      status: "NO_SUBSCRIPTION",
      message: "This organization has no subscription record yet.",
      subscription: null,
    };
  }

  return {
    status: subscription.status,
    subscription,
  };
};

export const SubscriptionServices = {
  createPlanInDB,
  getAllPlansFromDB,
  buySubscriptionInDB,
  getOrganizationSubscriptionFromDB,
};
