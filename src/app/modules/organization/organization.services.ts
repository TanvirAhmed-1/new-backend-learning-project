import prisma from "../../utils/prisma";
import { ICreateOrganization } from "./organization.interface";

const getOrganizationFormDB = async () => {
  const result = await prisma.organization.findMany();
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
    data,
  });
  
  return result;
};

const updateOrganizationInDB = async (
  id: string,
  data: ICreateOrganization
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
    data,
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

export const OrganizationServices = {
  getOrganizationFormDB,
  CreateOrganizationInDB,
  updateOrganizationInDB,
  deleteOrganizationInDB,
};
