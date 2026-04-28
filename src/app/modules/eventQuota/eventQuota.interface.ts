export interface IEventQuotaBulk {
  eventId: string;
  services: {
    serviceId: string;
    maxUsesPerPerson: number;
  }[];
}

export interface updateQuotaBulk {
  services: {
    serviceId: string;
    maxUsesPerPerson: number;
  }[];
}
