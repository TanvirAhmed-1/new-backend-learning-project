"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventSchema = void 0;
const zod_1 = require("zod");
exports.eventSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Event name is required"),
    startDate: zod_1.z.string(),
    endDate: zod_1.z.string(),
    organizationId: zod_1.z.string().optional(),
    creatorId: zod_1.z.string().optional(),
});
