import prisma from "../../utils/prisma";
import { ICreateOrganization } from "./organization.interface";
import bcrypt from "bcrypt";

const getOrganizationFormDB = async () => {
  const result = await prisma.organization.findMany({
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
  data: Partial<ICreateOrganization>
) => {
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

const deleteOrganizationInDB = async (id: string) => {
  const isExist = await prisma.organization.findUnique({
    where: {
      id,
    },
  });
  if (!isExist) {
    throw new Error("Organization not found");
  }
  const result = await prisma.organization.delete({
    where: {
      id,
    },
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
