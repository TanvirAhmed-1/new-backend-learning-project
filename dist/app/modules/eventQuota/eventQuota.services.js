"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventQuotaServices = void 0;
const prisma_1 = __importDefault(require("../../utils/prisma"));
const createEventQuota = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const { eventId, services } = data;
    //  Event check
    const eventExists = yield prisma_1.default.event.findUnique({
        where: { id: eventId },
    });
    if (!eventExists) {
        throw new Error("Event not found");
    }
    //  Duplicate check (optimized)
    const existing = yield prisma_1.default.eventQuota.findMany({
        where: {
            eventId,
            serviceId: {
                in: services.map((s) => s.serviceId),
            },
        },
    });
    if (existing.length > 0) {
        throw new Error("Some services already assigned to this event");
    }
    // Transaction use for multiple create + return
    const createdQuotas = yield prisma_1.default.$transaction(services.map((service) => prisma_1.default.eventQuota.create({
        data: {
            eventId,
            serviceId: service.serviceId,
            maxUsesPerPerson: service.maxUsesPerPerson,
        },
        include: {
            service: true,
        },
    })));
    return createdQuotas;
});
const getAllEventQuota = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const { page = 1, limit = 20, eventName, serviceName, status, toDate, fromDate, orderBy = "createdAt", sortOrder = "desc", } = query;
    const skip = (Number(page) - 1) * Number(limit);
    const where = {};
    // event filters
    if (eventName || status) {
        where.event = {};
        if (eventName) {
            where.event.name = {
                contains: eventName,
            };
        }
        if (status) {
            where.event.status = status;
        }
    }
    // service filters
    if (serviceName) {
        where.service = {
            name: {
                contains: serviceName,
            },
        };
    }
    // quota date 
    if (fromDate || toDate) {
        where.createdAt = {};
        if (fromDate)
            where.createdAt.gte = new Date(fromDate);
        if (toDate)
            where.createdAt.lte = new Date(toDate);
    }
    const data = yield prisma_1.default.eventQuota.findMany({
        where,
        include: {
            event: true,
            service: true,
        },
        skip,
        take: Number(limit),
        orderBy: {
            [orderBy]: sortOrder,
        },
    });
    const total = yield prisma_1.default.eventQuota.count({ where });
    return {
        meta: {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPage: Math.ceil(total / Number(limit)),
        },
        data,
    };
});
const updateEventQuota = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const { eventId, services } = data;
    if (!services || !Array.isArray(services)) {
        throw new Error("Invalid services payload");
    }
    const eventExists = yield prisma_1.default.event.findUnique({
        where: { id: eventId },
        select: { id: true },
    });
    if (!eventExists) {
        throw new Error("Event not found");
    }
    return prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        yield tx.eventQuota.deleteMany({
            where: { eventId },
        });
        yield tx.eventQuota.createMany({
            data: services.map((s) => ({
                eventId,
                serviceId: s.serviceId,
                maxUsesPerPerson: s.maxUsesPerPerson,
            })),
        });
        return tx.eventQuota.findMany({
            where: { eventId },
            include: {
                event: true,
                service: true,
            },
        });
    }));
});
const deleteEventQuota = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const exists = yield prisma_1.default.eventQuota.findUnique({
        where: { id },
    });
    if (!exists)
        throw new Error("EventQuota not found");
    return yield prisma_1.default.eventQuota.delete({
        where: { id },
    });
});
exports.EventQuotaServices = {
    createEventQuota,
    getAllEventQuota,
    updateEventQuota,
    deleteEventQuota,
};
