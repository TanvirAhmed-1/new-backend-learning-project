import config from "../config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export const seedSuperAdmin = async () => {
  const existing = await prisma.staff.findFirst({
    where: {
      role: "SUPER_ADMIN",
    },
  });

  // 👉 already exists → do nothing
  if (existing) {
    console.log("SUPER_ADMIN already exists");
    return;
  }

  const hashedPassword = await bcrypt.hash(
    config.superAdmin.password as string,
    10
  );

  await prisma.staff.create({
    data: {
      name: config.superAdmin.name as string,
      email: config.superAdmin.email as string,
      phone: config.superAdmin.phone as string,
      password: hashedPassword,
      role: "SUPER_ADMIN",
    },
  });

  console.log("SUPER_ADMIN created successfully");
};