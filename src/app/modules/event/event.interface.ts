export type IEvent = {
    id?: string;
    name: string;
    isActive?: boolean;
    startDate: Date;   // ❌ remove ?
    endDate: Date;     // ❌ remove ?
    createdAt?: Date;
    updatedAt?: Date;
  };