"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerTenantValidation = exports.createOrganization = void 0;
const zod_1 = require("zod");
exports.createOrganization = zod_1.z.object({
    name: zod_1.z.string({ message: "Name is required" }),
    cardDamageFee: zod_1.z.number({ message: "Card damage fee is required" }).optional(),
    country: zod_1.z.enum(["BANGLADESH", "GLOBAL"]).optional(),
    creatorId: zod_1.z.string().optional(),
});
exports.registerTenantValidation = zod_1.z.object({
    orgName: zod_1.z.string({ message: "Organization name is required" }),
    cardDamageFee: zod_1.z.number().optional(),
    adminName: zod_1.z.string({ message: "Admin name is required" }),
    adminEmail: zod_1.z.string({ message: "Admin email is required" }).email({ message: "Invalid email address" }),
    adminPhone: zod_1.z.string({ message: "Admin phone is required" }),
    adminPassword: zod_1.z.string({ message: "Admin password is required" }).min(6, { message: "Password must be at least 6 characters" }),
});
