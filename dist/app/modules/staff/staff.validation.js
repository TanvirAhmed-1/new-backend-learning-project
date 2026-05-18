"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StaffValidation = exports.Role = void 0;
const zod_1 = require("zod");
var Role;
(function (Role) {
    Role["SUPER_ADMIN"] = "SUPER_ADMIN";
    Role["MANAGER"] = "MANAGER";
    Role["ADMIN"] = "ADMIN";
    Role["OPERATOR"] = "OPERATOR";
})(Role || (exports.Role = Role = {}));
const createStaff = zod_1.z.object({
    name: zod_1.z.string({
        message: "Name is required",
    }),
    email: zod_1.z
        .string({ message: "Email is required" })
        .email("Invalid email format"),
    password: zod_1.z
        .string({ message: "Password is required" })
        .min(6, "Password must be at least 6 characters"),
    phone: zod_1.z
        .string({ message: "Phone is required" })
        .length(11, "Phone must be exactly 11 digits"),
    role: zod_1.z.nativeEnum(Role),
    counterId: zod_1.z.string().optional(),
    organizationId: zod_1.z.string().optional(),
});
const updateStaff = zod_1.z.object({
    name: zod_1.z.string().optional(),
    email: zod_1.z.string().email().optional(),
    password: zod_1.z.string().min(6).optional(),
    phone: zod_1.z.string().length(11).optional(),
    role: zod_1.z.nativeEnum(Role).optional(),
    counterId: zod_1.z.string().optional(),
    organizationId: zod_1.z.string().optional(),
});
exports.StaffValidation = {
    createStaff,
    updateStaff,
};
