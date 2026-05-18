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
exports.ServiceServices = void 0;
const prisma_1 = __importDefault(require("../../utils/prisma"));
const createServiceInDB = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const isExist = yield prisma_1.default.service.findUnique({
        where: { name: data.name },
    });
    if (isExist) {
        throw new Error("Service already exists");
    }
    const serviceType = yield prisma_1.default.serviceType.findUnique({
        where: { id: data.serviceTypeId },
    });
    if (!serviceType) {
        throw new Error("Invalid service type Id!");
    }
    if (data.counterId) {
        const counter = yield prisma_1.default.counter.findUnique({
            where: { id: data.counterId },
        });
        if (!counter) {
            throw new Error("Invalid counter");
        }
    }
    //  2. staff validation
    if (data.staffId) {
        const staff = yield prisma_1.default.staff.findUnique({
            where: { id: data.staffId },
        });
        if (!staff) {
            throw new Error("Invalid staff");
        }
    }
    const result = yield prisma_1.default.service.create({
        data: {
            name: data.name,
            price: data.price,
            image: data.image,
            description: data.description,
            serviceTypeId: data.serviceTypeId,
            counterId: data.counterId,
            staffId: data.staffId,
            organizationId: data.organizationId || null,
        },
    });
    return result;
});
const getServicesFromDB = (queryParams) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, minPrice, maxPrice, counterId, status, organizationId, page = 1, limit = 20, sortBy = "createdAt", sortOrder = "desc", } = queryParams;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);
    const andConditions = [];
    if (name) {
        andConditions.push({
            name: {
                contains: name,
            },
        });
    }
    // ২. Status Filter
    if (status !== undefined && status !== "") {
        andConditions.push({
            isActive: status === "true" || status === true,
        });
    }
    // ৩. Counter Filter
    if (counterId) {
        andConditions.push({
            OR: [
                { counterId: counterId },
                { counterId: null }
            ],
        });
    }
    // ৩.৫. Organization Filter
    if (organizationId) {
        andConditions.push({
            organizationId,
        });
    }
    // ৪. Price Range Filter
    if (minPrice || maxPrice) {
        const priceFilter = {};
        if (minPrice)
            priceFilter.gte = Number(minPrice);
        if (maxPrice)
            priceFilter.lte = Number(maxPrice);
        andConditions.push({
            price: priceFilter,
        });
    }
    const whereCondition = andConditions.length > 0 ? { AND: andConditions } : {};
    const data = yield prisma_1.default.service.findMany({
        where: whereCondition,
        skip,
        take,
        orderBy: {
            [sortBy]: sortOrder,
        },
        include: {
            serviceType: {
                select: { name: true },
            },
            counter: {
                select: { name: true },
            },
        },
    });
    const total = yield prisma_1.default.service.count({
        where: whereCondition,
    });
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
const getSingleServiceFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.service.findUnique({
        where: { id },
        include: {
            serviceType: true,
            counter: true,
            staff: true,
        },
    });
    if (!result) {
        throw new Error("Service not found");
    }
    return result;
});
const updateServiceInDB = (id, data) => __awaiter(void 0, void 0, void 0, function* () {
    const isExist = yield prisma_1.default.service.findUnique({ where: { id } });
    if (!isExist) {
        throw new Error("Service not found");
    }
    const result = yield prisma_1.default.service.update({
        where: { id },
        data,
    });
    return result;
});
const deleteServiceFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const isExist = yield prisma_1.default.service.findUnique({ where: { id } });
    if (!isExist) {
        throw new Error("Service not found");
    }
    return yield prisma_1.default.service.delete({
        where: { id },
    });
});
//service used
const useServiceFromDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { cardUid, serviceId, qty = 1 } = payload;
    if (!cardUid)
        throw new Error("cardUid is required");
    if (!serviceId)
        throw new Error("serviceId is required");
    return yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c;
        // =========================
        // 1. GET CARD + USER
        // =========================
        const card = yield tx.card.findUnique({
            where: { cardUid: cardUid },
            include: { user: true },
        });
        if (!card)
            throw new Error("Card not found");
        const user = card.user;
        if (!user)
            throw new Error("No user assigned to this card");
        // =========================
        // 2. GET SERVICE
        // =========================
        const service = yield tx.service.findUnique({
            where: { id: serviceId },
        });
        if (!service)
            throw new Error("Service not found");
        const price = Number(service.price) * qty;
        let isFree = false;
        // =========================
        // 3. EVENT CHECK (AUTO)
        // =========================
        if (user.activeEventId) {
            const event = yield tx.event.findUnique({
                where: { id: user.activeEventId },
            });
            if (event && event.status === "ACTIVE") {
                const quota = yield tx.eventQuota.findUnique({
                    where: {
                        eventId_serviceId: {
                            eventId: event.id,
                            serviceId,
                        },
                    },
                });
                if (quota) {
                    const usedCount = yield tx.transaction.count({
                        where: {
                            userId: user.id,
                            serviceId,
                            eventId: event.id,
                        },
                    });
                    if (usedCount < quota.maxUsesPerPerson) {
                        isFree = true;
                    }
                }
            }
        }
        // =========================
        // 4. BALANCE CHECK
        // =========================
        const balanceBefore = Number(user.balance);
        // 🔥 CUSTOM ERROR LOGIC
        if (!isFree && balanceBefore < price) {
            if (user.activeEventId) {
                throw new Error("Free quota ended. Please recharge balance");
            }
            else {
                throw new Error("Insufficient balance");
            }
        }
        const balanceAfter = isFree ? balanceBefore : balanceBefore - price;
        // =========================
        // 5. UPDATE USER BALANCE
        // =========================
        yield tx.user.update({
            where: { id: user.id },
            data: {
                balance: balanceAfter,
            },
        });
        // =========================
        // 7. CREATE TRANSACTION
        // =========================
        return yield tx.transaction.create({
            data: {
                userId: user.id,
                cardId: card.id,
                serviceId,
                eventId: (_a = user.activeEventId) !== null && _a !== void 0 ? _a : null,
                organizationId: (_c = (_b = service.organizationId) !== null && _b !== void 0 ? _b : user.organizationId) !== null && _c !== void 0 ? _c : null,
                type: "USAGE",
                amount: price,
                quantity: qty,
                balanceBefore,
                balanceAfter,
            },
        });
    }));
});
exports.ServiceServices = {
    createServiceInDB,
    getServicesFromDB,
    getSingleServiceFromDB,
    updateServiceInDB,
    deleteServiceFromDB,
    useServiceFromDB,
};
