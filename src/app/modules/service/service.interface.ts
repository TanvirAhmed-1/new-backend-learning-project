export type IServiceRequest = {
  name: string;
  price: number;
  image?: string;
  description?: string;
  serviceTypeId: string;
  counterId?: string;
  staffId?: string;
  organizationId?: string;
};
