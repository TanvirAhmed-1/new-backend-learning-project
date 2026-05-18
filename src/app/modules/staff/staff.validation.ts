import { z } from "zod";

export enum Role {
  SUPER_ADMIN = "SUPER_ADMIN",
  MANAGER = "MANAGER",
  ADMIN = "ADMIN",
  OPERATOR = "OPERATOR",
}

const createStaff = z.object({
  name: z.string({
    message: "Name is required",
  }),

  email: z
    .string({ message: "Email is required" })
    .email("Invalid email format"),

  password: z
    .string({ message: "Password is required" })
    .min(6, "Password must be at least 6 characters"),

  phone: z
    .string({ message: "Phone is required" })
    .length(11, "Phone must be exactly 11 digits"),

  role: z.nativeEnum(Role),

  counterId: z.string().optional(),
  organizationId: z.string().optional(),
});

const updateStaff = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  phone: z.string().length(11).optional(),
  role: z.nativeEnum(Role).optional(),
  counterId: z.string().optional(),
  organizationId: z.string().optional(),
});

export const StaffValidation = {
  createStaff,
  updateStaff,
};
