export type Role = "SUPER_ADMIN" | "MANAGER" | "ADMIN" | "OPERATOR";

export interface IStaff {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  role: Role;
  isActive?: boolean;
  counterId?: string;
  organizationId?: string;
}
