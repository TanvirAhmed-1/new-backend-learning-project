import prisma from "../../utils/prisma";
import { ICreateOrganization } from "./organization.interface";
import bcrypt from "bcrypt";

const getOrganizationFormDB = async (user?: any) => {
  const whereCondition = user?.role === "SUPER_ADMIN"
    ? {}
    : { id: user?.organizationId || "" };

  const result = await prisma.organization.findMany({
    where: whereCondition,
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
      _count: {
        select: {
          staffs: true,
          events: true,
          users: true,
          counters: true,
        },
      },
    },
  });
  return result;
};

const CreateOrganizationInDB = async (data: ICreateOrganization) => {
  const isExist = await prisma.organization.findUnique({
    where: {
      name: data.name,
    },
  });

  if (isExist) {
    throw new Error("Organization already exists");
  }

  const result = await prisma.organization.create({
    data: {
      name: data.name,
      cardDamageFee: data.cardDamageFee,
      country: data.country,
      creatorId: data.creatorId,
    },
  });
  
  return result;
};

const updateOrganizationInDB = async (
  id: string,
  data: Partial<ICreateOrganization>,
  user?: any
) => {
  // Enforce SaaS strict tenancy check
  if (user?.role !== "SUPER_ADMIN" && id !== user?.organizationId) {
    throw new Error("Forbidden Access! You do not have permission to update this organization.");
  }

  const isExist = await prisma.organization.findUnique({
    where: {
      id,
    },
  });
  if (!isExist) {
    throw new Error("Organization not found");
  }
  const result = await prisma.organization.update({
    where: {
      id,
    },
    data: {
      name: data.name,
      cardDamageFee: data.cardDamageFee,
      country: data.country,
      creatorId: data.creatorId,
    },
  });
  return result;
};

const deleteOrganizationInDB = async (id: string, user?: any) => {
  // Enforce SaaS strict tenancy check
  if (user?.role !== "SUPER_ADMIN" && id !== user?.organizationId) {
    throw new Error("Forbidden Access! You do not have permission to delete this organization.");
  }

  const isExist = await prisma.organization.findUnique({
    where: {
      id,
    },
  });
  if (!isExist) {
    throw new Error("Organization not found");
  }

  // Atomic database transaction to cascade delete all organization-associated data
  const result = await prisma.$transaction(async (tx) => {
    // 1. Delete Subscription Payments
    await tx.subscriptionPayment.deleteMany({
      where: {
        subscription: {
          organizationId: id,
        },
      },
    });

    // 2. Delete Subscriptions
    await tx.subscription.deleteMany({
      where: {
        organizationId: id,
      },
    });

    // 3. Delete Transactions
    await tx.transaction.deleteMany({
      where: {
        organizationId: id,
      },
    });

    // 4. Delete Event Quotas
    await tx.eventQuota.deleteMany({
      where: {
        organizationId: id,
      },
    });

    // 5. Delete Events
    await tx.event.deleteMany({
      where: {
        organizationId: id,
      },
    });

    // 6. Delete Notifications
    await tx.notification.deleteMany({
      where: {
        organizationId: id,
      },
    });

    // 7. Delete Cards
    await tx.card.deleteMany({
      where: {
        organizationId: id,
      },
    });

    // 8. Delete Users
    await tx.user.deleteMany({
      where: {
        organizationId: id,
      },
    });

    // 9. Delete Services
    await tx.service.deleteMany({
      where: {
        organizationId: id,
      },
    });

    // 10. Delete Service Types
    await tx.serviceType.deleteMany({
      where: {
        organizationId: id,
      },
    });

    // 11. Delete Counters
    await tx.counter.deleteMany({
      where: {
        organizationId: id,
      },
    });

    // 12. Break the cyclic relationship between creator staff and organization creatorId
    await tx.organization.update({
      where: {
        id,
      },
      data: {
        creatorId: null,
      },
    });

    // 13. Delete Staffs
    await tx.staff.deleteMany({
      where: {
        organizationId: id,
      },
    });

    // 14. Finally, delete the Organization itself
    const deletedOrg = await tx.organization.delete({
      where: {
        id,
      },
    });

    return deletedOrg;
  });

  return result;
};

const registerTenantInDB = async (payload: any) => {
  const { orgName, cardDamageFee, adminName, adminEmail, adminPhone, adminPassword } = payload;

  // 1. Check if organization already exists
  const orgExists = await prisma.organization.findUnique({
    where: { name: orgName },
  });
  if (orgExists) {
    throw new Error("Organization name already taken!");
  }

  // 2. Check if staff email already exists
  const staffExists = await prisma.staff.findUnique({
    where: { email: adminEmail },
  });
  if (staffExists) {
    throw new Error("An administrator staff with this email already exists!");
  }

  // 3. Hash password
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  // 4. Atomic database transaction
  const result = await prisma.$transaction(async (tx) => {
    // Create Organization
    const newOrg = await tx.organization.create({
      data: {
        name: orgName,
        cardDamageFee: cardDamageFee || 0,
      },
    });

    // Create Admin Staff
    const newStaff = await tx.staff.create({
      data: {
        name: adminName,
        email: adminEmail,
        phone: adminPhone,
        password: hashedPassword,
        role: "ADMIN",
        organizationId: newOrg.id,
      },
    });

    // Link organization creator to the newly created admin staff
    const updatedOrg = await tx.organization.update({
      where: { id: newOrg.id },
      data: {
        creatorId: newStaff.id,
      },
    });

    // Check if subscription plan exists, else create default Trial Plan
    let plan = await tx.subscriptionPlan.findFirst({
      where: { name: "Trial Plan" },
    });
    if (!plan) {
      plan = await tx.subscriptionPlan.create({
        data: {
          name: "Trial Plan",
          description: "30 Days Free Trial on signup",
          price: 0,
          billingCycle: "MONTHLY",
          maxUsers: 100,
          maxEvents: 10,
          maxStaffs: 10,
          isActive: true,
        },
      });
    }

    // Auto-create a 30-day Free Trial subscription so tenant isn't locked out
    const subscription = await tx.subscription.create({
      data: {
        organizationId: newOrg.id,
        planId: plan.id,
        status: "TRIAL",
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days free trial
      },
    });

    return {
      organization: updatedOrg,
      admin: {
        id: newStaff.id,
        name: newStaff.name,
        email: newStaff.email,
        role: newStaff.role,
      },
      subscription,
    };
  });

  return result;
};

export const OrganizationServices = {
  getOrganizationFormDB,
  CreateOrganizationInDB,
  updateOrganizationInDB,
  deleteOrganizationInDB,
  registerTenantInDB,
};
