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
exports.CardServices = void 0;
const prisma_1 = __importDefault(require("../../utils/prisma"));
const user_utils_1 = require("../user/user.utils");
const createCardInDB = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const { type, cardUid: inputCardUid } = data;
    if (type !== "NFC" && type !== "RFID" && type !== "VIRTUAL") {
        throw new Error("Invalid card type");
    }
    if (type === "NFC" || type === "RFID") {
        if (!inputCardUid) {
            throw new Error("Card UID is required");
        }
    }
    // check organization
    if (data.organizationId) {
        const organization = yield prisma_1.default.organization.findUnique({
            where: { id: data.organizationId },
        });
        if (!organization) {
            throw new Error("Organization not found");
        }
    }
    let cardUid = null;
    const cardCode = (0, user_utils_1.generateCardCode)();
    //  NFC/RFID
    if (type === "NFC" || type === "RFID") {
        if (!inputCardUid) {
            throw new Error("Card UID is required for NFC/RFID");
        }
        // check duplicate ONLY when input exists
        const isExist = yield prisma_1.default.card.findUnique({
            where: { cardUid: inputCardUid },
        });
        if (isExist) {
            throw new Error("Card UID already exists");
        }
        cardUid = inputCardUid;
    }
    const result = yield prisma_1.default.card.create({
        data: {
            type,
            cardUid,
            cardCode,
            status: "INACTIVE",
            organizationId: data.organizationId,
        },
    });
    return result;
});
const getAllCardFormDB = (queryParams) => __awaiter(void 0, void 0, void 0, function* () {
    const { cardUid, cardCode, status, organizationId, fromDate, toDate, page = 1, limit = 20, sortBy = "createdAt", sortOrder = "desc", } = queryParams;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);
    const where = {};
    if (organizationId) {
        where.organizationId = organizationId;
    }
    // 🔹 Filtering Logic
    if (cardUid) {
        where.cardUid = {
            contains: cardUid,
        };
    }
    if (cardCode) {
        where.cardCode = {
            contains: cardCode,
        };
    }
    if (status) {
        where.status = status;
    }
    // 🔹 Date filter
    if (fromDate || toDate) {
        where.createdAt = {};
        if (fromDate) {
            const start = new Date(fromDate);
            start.setHours(0, 0, 0, 0);
            where.createdAt.gte = start;
        }
        if (toDate) {
            const end = new Date(toDate);
            end.setHours(23, 59, 59, 999);
            where.createdAt.lte = end;
        }
    }
    // 🔹 Querying Database
    const data = yield prisma_1.default.card.findMany({
        where,
        skip,
        take,
        orderBy: {
            [sortBy]: sortOrder,
        },
        select: {
            id: true,
            cardUid: true,
            cardCode: true,
            type: true,
            status: true,
            organizationId: true,
            createdAt: true,
            user: {
                select: {
                    id: true,
                    name: true,
                    phone: true,
                    status: true,
                    balance: true,
                },
            },
        },
    });
    // 🔹 Total count for pagination meta
    const total = yield prisma_1.default.card.count({
        where,
    });
    return {
        meta: {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPage: Math.ceil(total / Number(limit)),
        },
        data: data,
    };
});
const getSingleCardDetailsFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const isExist = yield prisma_1.default.card.findUnique({ where: { id } });
    if (!isExist) {
        throw new Error("Card not found");
    }
    const result = yield prisma_1.default.card.findUnique({
        where: { id },
        include: {
            transactions: {
                include: {
                    user: true,
                    service: true,
                    staff: true,
                },
                orderBy: {
                    createdAt: "desc",
                },
            },
        },
    });
    return result;
});
const getVirtualInactiveCardFromDB = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (query = {}) {
    const { organizationId } = query;
    const where = { type: "VIRTUAL", status: "INACTIVE" };
    if (organizationId) {
        where.organizationId = organizationId;
    }
    const result = yield prisma_1.default.card.findFirst({
        where,
    });
    return result;
});
const deleteCardFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const isExist = yield prisma_1.default.card.findUnique({ where: { id } });
    if (!isExist) {
        throw new Error("Card not found");
    }
    if (isExist.status === "ACTIVE") {
        throw new Error("Cannot delete an active card");
    }
    const hasTransaction = yield prisma_1.default.transaction.findFirst({
        where: { cardId: id },
    });
    if (hasTransaction) {
        throw new Error("Card has transactions, cannot delete");
    }
    const result = yield prisma_1.default.card.delete({ where: { id } });
    return result;
});
exports.CardServices = {
    createCardInDB,
    getAllCardFormDB,
    getVirtualInactiveCardFromDB,
    deleteCardFromDB,
    getSingleCardDetailsFromDB,
};
