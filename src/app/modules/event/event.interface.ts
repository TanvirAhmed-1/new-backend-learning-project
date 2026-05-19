export type IEvent = {
    id?: string;
    name: string;
    isActive?: boolean;
    startDate: Date;
    endDate: Date;
    organizationId?: string;
    creatorId?: string;
    status?: "ACTIVE" | "INACTIVE" | "LOCKED";
    createdAt?: Date;
    updatedAt?: Date;
  };