"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceValidation = void 0;
const zod_1 = require("zod");
const createService = zod_1.z.object({
    name: zod_1.z.string({ message: "Service name is required" }),
    price: zod_1.z.coerce.number({ message: "Price is required" }),
    image: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    serviceTypeId: zod_1.z.string(),
    counterId: zod_1.z.string().optional(),
    staffId: zod_1.z.string().optional(),
    organizationId: zod_1.z.string().optional(),
});
const updateService = zod_1.z.object({
    name: zod_1.z.string().optional(),
    price: zod_1.z.number().optional(),
    image: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    isActive: zod_1.z.boolean().optional(),
    counterId: zod_1.z.string().optional(),
    staffId: zod_1.z.string().optional(),
    organizationId: zod_1.z.string().optional(),
});
const useServiceValidation = zod_1.z.object({
    cardUid: zod_1.z.string({ message: "Card ID is required" }),
    serviceId: zod_1.z.string().uuid({ message: "Service ID is required" }),
    qty: zod_1.z.number({ message: "Quantity is required" }).optional(),
});
exports.ServiceValidation = {
    createService,
    updateService,
    useServiceValidation
};
