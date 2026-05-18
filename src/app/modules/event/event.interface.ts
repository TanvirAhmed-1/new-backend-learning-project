export type IEvent = {
    id?: string;
    name: string;
    isActive?: boolean;
    startDate: Date;
    endDate: Date;
    organizationId?: string;
    creatorId?: string;
    createdAt?: Date;
    updatedAt?: Date;
  };