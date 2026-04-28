export type IServiceRequest = {
  name: string;
  price: number;
  image?: string;
  description?: string;
  quantity?: number | null;
  usedQuantity?: number;
  serviceTypeId: string;
  counterId?: string;
  staffId?: string;
};
