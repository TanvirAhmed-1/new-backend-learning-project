import { Country } from "@prisma/client";

export type ICreateOrganization = {
  name: string;
  cardDamageFee?: number;
  country?: Country;
  creatorId?: string;
};
