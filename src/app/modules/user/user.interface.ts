export interface ICreateUser {
  phone: string;
  name?: string;
  email?: string;
  cardId?: string;
  balance: number;
  pinHash?: string;
  organizationId: string;
  CardType?: "VIRTUAL";
  eventId?: string;
}

export type UpdateUserInput = {
  name?: string;
  email?: string;
  phone?: string;
};
