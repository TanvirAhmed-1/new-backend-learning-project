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
exports.EventService = void 0;
const prisma_1 = __importDefault(require("../../utils/prisma"));
const createEvent = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const exists = yield prisma_1.default.event.findFirst({
        where: { name: data.name },
    });
    if (exists) {
        throw new Error("Event with this name already exists");
    }
    return yield prisma_1.default.event.create({
        data: {
            name: data.name,
            startDate: new Date(data.startDate),
            endDate: new Date(data.endDate),
            organizationId: data.organizationId || null,
            creatorId: data.creatorId || null,
        },
    });
});
const getAllEvent = (queryParams) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, status, fromDate, toDate, organizationId, creatorId, page = 1, limit = 20, sortBy = "createdAt", sortOrder = "desc", } = queryParams;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);
    const where = {};
    if (name) {
        where.name = {
            contains: name,
        };
    }
    if (status) {
        where.status = status;
    }
    if (organizationId) {
        where.organizationId = organizationId;
    }
    if (creatorId) {
        where.creatorId = creatorId;
    }
    if (fromDate || toDate) {
        where.createdAt = {};
        if (fromDate)
            where.createdAt.gte = new Date(fromDate);
        if (toDate)
            where.createdAt.lte = new Date(toDate);
    }
    const events = yield prisma_1.default.event.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy]: sortOrder },
        include: {
            _count: {
                select: {
                    activeUsers: true,
                    transactions: true,
                    eventQuotas: true,
                },
            },
        },
    });
    const total = yield prisma_1.default.event.count({ where });
    return {
        meta: {
            page,
            limit,
            total: total,
            totalPage: Math.ceil(total / Number(limit)),
        },
        data: events,
    };
});
const getSingleEventUserFormDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    if (!id)
        throw new Error("Event ID is required");
    const event = yield prisma_1.default.event.findUnique({
        where: { id },
        include: {
            activeUsers: true,
            _count: {
                select: {
                    activeUsers: true,
                    transactions: true,
                    eventQuotas: true,
                },
            },
        },
    });
    if (!event)
        throw new Error("Event not found");
    return event;
});
const getSingleEventQuotaFormDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    if (!id)
        throw new Error("Event ID is required");
    const isExist = yield prisma_1.default.event.findUnique({
        where: { id },
    });
    if (!isExist)
        throw new Error("Event not found");
    const event = yield prisma_1.default.event.findUnique({
        where: { id },
        include: {
            eventQuotas: {
                select: {
                    id: true,
                    maxUsesPerPerson: true,
                    service: true,
                },
            },
            _count: {
                select: {
                    eventQuotas: true,
                },
            },
        },
    });
    return event;
});
const updateEvent = (id, data) => __awaiter(void 0, void 0, void 0, function* () {
    const exists = yield prisma_1.default.event.findUnique({
        where: { id },
    });
    if (!exists)
        throw new Error("Event not found");
    return yield prisma_1.default.event.update({
        where: { id },
        data,
    });
});
const deleteEvent = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const exists = yield prisma_1.default.event.findUnique({
        where: { id },
    });
    if (!exists)
        throw new Error("Event not found");
    return yield prisma_1.default.event.delete({
        where: { id },
    });
});
const lockEvent = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        // 1. Lock Event
        const event = yield tx.event.update({
            where: { id },
            data: {
                status: "LOCKED",
            },
        });
        // 2. INACTIVE all users of this event
        const users = yield tx.user.findMany({
            where: {
                activeEventId: id,
            },
            select: {
                id: true,
            },
        });
        const userIds = users.map((u) => u.id);
        yield tx.user.updateMany({
            where: {
                activeEventId: id,
            },
            data: {
                activeEventId: null,
                status: "INACTIVE",
            },
        });
        // 3. INACTIVE all cards of those users (IMPORTANT FIX)
        yield tx.card.updateMany({
            where: {
                currentUserId: {
                    in: userIds,
                },
            },
            data: {
                status: "INACTIVE",
            },
        });
        return event;
    }));
});
const getAllEventUserFormDB = (queryParams) => __awaiter(void 0, void 0, void 0, function* () {
    const { phone, eventName, status, fromDate, toDate, page = 1, limit = 20, sortBy = "createdAt", sortOrder = "desc", } = queryParams;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);
    const where = {};
    if (eventName) {
        where.name = {
            contains: eventName,
        };
    }
    if (status) {
        where.status = status;
    }
    if (fromDate || toDate) {
        where.createdAt = {};
        if (fromDate)
            where.createdAt.gte = new Date(fromDate);
        if (toDate)
            where.createdAt.lte = new Date(toDate);
    }
    if (phone) {
        where.activeUsers = {
            some: {
                phone: {
                    contains: phone,
                },
            },
        };
    }
    const events = yield prisma_1.default.event.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy]: sortOrder },
        include: {
            activeUsers: {
                where: phone ? { phone: { contains: phone } } : undefined,
                include: {
                    cards: true,
                },
            },
            eventQuotas: true,
        },
    });
    const total = yield prisma_1.default.event.count({ where });
    return {
        meta: {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPage: Math.ceil(total / Number(limit)),
        },
        data: events,
    };
});
const deleteeventUserFormDB = (eventId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const isExist = yield prisma_1.default.event.findUnique({
        where: { id: eventId },
    });
    if (!isExist)
        throw new Error("Event not found");
    const isUserExist = yield prisma_1.default.user.findUnique({
        where: { id: userId },
    });
    if (!isUserExist)
        throw new Error("User not found");
    if (isUserExist.activeEventId !== eventId) {
        throw new Error("User is not active in this event");
    }
    return yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        const updatedUser = yield tx.user.update({
            where: { id: userId },
            data: {
                activeEventId: null,
                status: "INACTIVE",
                pinHash: null,
                isPinSet: false,
                balance: 0,
            },
        });
        yield tx.card.updateMany({
            where: { currentUserId: userId },
            data: {
                status: "INACTIVE",
            },
        });
        return updatedUser;
    }));
});
const getEventAnalyticsFormDB = (queryParams) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, status, fromDate, toDate, organizationId, page = 1, limit = 20, sortBy = "createdAt", sortOrder = "desc", } = queryParams;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);
    const where = {};
    if (name) {
        where.name = {
            contains: name,
        };
    }
    if (status) {
        where.status = status;
    }
    if (organizationId) {
        where.organizationId = organizationId;
    }
    if (fromDate || toDate) {
        where.createdAt = {};
        if (fromDate)
            where.createdAt.gte = new Date(fromDate);
        if (toDate)
            where.createdAt.lte = new Date(toDate);
    }
    const events = yield prisma_1.default.event.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy]: sortOrder },
        include: {
            activeUsers: {
                select: { id: true },
            },
            transactions: {
                select: { id: true, amount: true },
            },
            eventQuotas: {
                include: {
                    service: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            },
        },
    });
    const formatted = events.map((event) => {
        const activeUsersCount = event.activeUsers.length;
        const totalAllowedUses = event.eventQuotas.reduce((sum, q) => {
            return sum + q.maxUsesPerPerson * activeUsersCount;
        }, 0);
        const usedUses = event.eventQuotas.reduce((sum, q) => {
            return sum + q.usedCount;
        }, 0);
        return {
            id: event.id,
            name: event.name,
            status: event.status,
            startDate: event.startDate,
            endDate: event.endDate,
            activeUsersCount,
            totalTransactions: event.transactions.length,
            quota: {
                totalAllowedUses,
                usedUses,
                remainingUses: totalAllowedUses - usedUses,
            },
        };
    });
    const total = yield prisma_1.default.event.count({ where });
    return {
        meta: {
            page,
            limit,
            total,
            totalPage: Math.ceil(total / Number(limit)),
        },
        data: formatted,
    };
});
const getSingleEventAnalyticsFormDB = (eventId, query) => __awaiter(void 0, void 0, void 0, function* () {
    const { phone, status, cardUid, limit = 20, page = 1, sortBy = "createdAt", sortOrder = "desc" } = query;
    if (!eventId)
        throw new Error("Event ID is required");
    const existEvent = yield prisma_1.default.event.findUnique({
        where: { id: eventId },
        include: {
            eventQuotas: {
                include: { service: true }
            },
            _count: {
                select: { activeUsers: true, transactions: true }
            }
        }
    });
    if (!existEvent)
        throw new Error("Event not found");
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);
    const where = {
        activeEventId: eventId,
    };
    // 🔹 Phone filter
    if (phone) {
        where.phone = { contains: phone };
    }
    // 🔹 Status filter
    if (status) {
        where.status = status;
    }
    // 🔹 Card UID filter
    if (cardUid) {
        where.cards = {
            some: {
                cardUid: { contains: cardUid },
            },
        };
    }
    const users = yield prisma_1.default.user.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy]: sortOrder },
        include: {
            cards: true,
            transactions: {
                orderBy: { createdAt: "desc" },
                include: {
                    service: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                    counter: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            },
        },
    });
    const total = yield prisma_1.default.user.count({ where });
    const formattedUsers = users.map((user) => {
        const servicesQuota = existEvent.eventQuotas.map((quota) => {
            const usedCount = user.transactions
                .filter((t) => t.type === "USAGE" && t.serviceId === quota.serviceId)
                .reduce((sum, t) => sum + Number(t.quantity || 1), 0);
            return {
                serviceId: quota.serviceId,
                serviceName: quota.service.name,
                totalAllowed: quota.maxUsesPerPerson,
                used: usedCount,
                remaining: Math.max(0, quota.maxUsesPerPerson - usedCount),
            };
        });
        return {
            id: user.id,
            name: user.name,
            phone: user.phone,
            email: user.email,
            status: user.status,
            balance: Number(user.balance),
            cards: user.cards,
            transactions: user.transactions,
            servicesQuota,
        };
    });
    return {
        meta: {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPage: Math.ceil(total / Number(limit)),
        },
        event: {
            id: existEvent.id,
            name: existEvent.name,
            startDate: existEvent.startDate,
            endDate: existEvent.endDate,
            status: existEvent.status
        },
        data: formattedUsers,
    };
});
exports.EventService = {
    createEvent,
    getAllEvent,
    getSingleEventUserFormDB,
    getSingleEventQuotaFormDB,
    updateEvent,
    deleteEvent,
    lockEvent,
    getAllEventUserFormDB,
    deleteeventUserFormDB,
    getEventAnalyticsFormDB,
    getSingleEventAnalyticsFormDB,
};
