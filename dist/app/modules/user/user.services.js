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
exports.UserServices = void 0;
const crypto_1 = require("crypto");
const prisma_1 = __importDefault(require("../../utils/prisma"));
const client_1 = require("@prisma/client");
const user_utils_1 = require("./user.utils");
const createUserWithCard = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const { phone, name, email, cardId, balance, pinHash, CardType, organizationId, eventId, } = data;
    return yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        if (organizationId) {
            const organization = yield prisma_1.default.organization.findUnique({
                where: { id: organizationId },
            });
            if (!organization) {
                throw new Error("Organization not found");
            }
        }
        if (eventId) {
            const event = yield prisma_1.default.event.findUnique({
                where: { id: eventId },
            });
            if (!event) {
                throw new Error("Event is  not found!");
            }
        }
        let card;
        // =========================
        // VIRTUAL CARD FLOW
        // =========================
        if (CardType === "VIRTUAL") {
            const { cardUid, cardCode } = yield (0, user_utils_1.generateUniqueCardData)(tx);
            card = yield tx.card.create({
                data: {
                    type: "VIRTUAL",
                    cardUid,
                    cardCode,
                    status: "ACTIVE",
                    organizationId: data.organizationId,
                },
            });
        }
        // =========================
        //  NFC / RFID FLOW
        // =========================
        else {
            if (!cardId)
                throw new Error("Card ID is required");
            card = yield tx.card.findUnique({
                where: { cardUid: cardId },
            });
            if (!card)
                throw new Error("Card not found");
            if (card.status === "ACTIVE")
                throw new Error("Card already active");
        }
        // =========================
        // USER CHECK
        // =========================
        const existingUser = yield tx.user.findUnique({
            where: { phone },
        });
        if ((existingUser === null || existingUser === void 0 ? void 0 : existingUser.status) === "ACTIVE")
            throw new Error("User already active In this Phone number");
        let user;
        const balanceDecimal = new client_1.Prisma.Decimal(balance);
        // =========================
        // EXISTING USER → UPDATE
        // =========================
        if (existingUser) {
            user = yield tx.user.update({
                where: { phone },
                data: {
                    name,
                    email,
                    status: "ACTIVE",
                    activeEventId: eventId !== null && eventId !== void 0 ? eventId : existingUser.activeEventId,
                    balance: {
                        increment: balanceDecimal,
                    },
                    pinHash: pinHash !== null && pinHash !== void 0 ? pinHash : existingUser.pinHash,
                    isPinSet: Boolean(pinHash),
                    userPresent: (0, user_utils_1.updateVisit)((_a = existingUser.userPresent) !== null && _a !== void 0 ? _a : {}),
                    previousName: [
                        ...(Array.isArray(existingUser.previousName)
                            ? existingUser.previousName
                            : []),
                        existingUser.name,
                    ].filter(Boolean),
                    previousEmail: [
                        ...(Array.isArray(existingUser.previousEmail)
                            ? existingUser.previousEmail
                            : []),
                        existingUser.email,
                    ].filter(Boolean),
                    previousEventId: eventId
                        ? [
                            ...(Array.isArray(existingUser.previousEventId)
                                ? existingUser.previousEventId
                                : []),
                            eventId,
                        ]
                        : (_b = existingUser.previousEventId) !== null && _b !== void 0 ? _b : [],
                },
            });
        }
        // =========================
        // NEW USER → CREATE
        // =========================
        else {
            user = yield tx.user.create({
                data: {
                    phone,
                    name,
                    email,
                    status: "ACTIVE",
                    balance: balanceDecimal,
                    pinHash: pinHash !== null && pinHash !== void 0 ? pinHash : null,
                    isPinSet: Boolean(pinHash),
                    activeEventId: eventId !== null && eventId !== void 0 ? eventId : null,
                    organizationId: organizationId || null,
                    userPresent: {
                        [(0, user_utils_1.getToday)()]: 1,
                    },
                    previousName: [],
                    previousEmail: [],
                    previousEventId: eventId ? [eventId] : [],
                },
            });
        }
        // =========================
        // UPDATE CARD
        // =========================
        const updatedCard = yield tx.card.update({
            where: { id: card.id },
            data: {
                currentUserId: user.id,
                status: "ACTIVE",
            },
        });
        // =========================
        // TRANSACTION
        // =========================
        if (balance > 0) {
            yield tx.transaction.create({
                data: {
                    userId: user.id,
                    cardId: card.id,
                    serviceId: null,
                    type: "TOPUP",
                    amount: balanceDecimal,
                    quantity: 1,
                    balanceBefore: user.balance,
                    balanceAfter: new client_1.Prisma.Decimal(Number(user.balance) + Number(balance)),
                },
            });
        }
        // =========================
        // CREATE VIRTUAL CARD ACCESS (ONLY VIRTUAL)
        // =========================
        if (CardType === "VIRTUAL") {
            const token = (0, crypto_1.randomBytes)(32).toString("hex");
            yield tx.virtualCardAccess.create({
                data: {
                    userId: user.id,
                    cardId: updatedCard.id,
                    phone: user.phone,
                    token,
                    status: "PENDING",
                    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
                },
            });
        }
        return {
            user,
            card: updatedCard,
        };
    }));
});
const getNewCardIssuedUserFormDB = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const { type, phone, organizationId, fromDate, toDate, orderBy = "updatedAt", sortOrder = "desc", page = 1, limit = 20, } = query;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);
    // 🔥 WHERE CONDITION
    const where = {};
    if (organizationId) {
        where.organizationId = organizationId;
    }
    // 🔹 Phone filter (user)
    if (phone) {
        where.phone = {
            contains: phone,
        };
    }
    // 🔹 Date filter
    if (fromDate || toDate) {
        where.createdAt = {};
        if (fromDate)
            where.createdAt.gte = new Date(fromDate);
        if (toDate)
            where.createdAt.lte = new Date(toDate);
    }
    //  Card filter
    if (type) {
        where.cards = {
            some: {
                type: type,
            },
        };
    }
    // 🔹 QUERY
    const users = yield prisma_1.default.user.findMany({
        where,
        skip,
        take,
        orderBy: {
            [orderBy]: sortOrder,
        },
        include: {
            cards: true,
            transactions: {
                take: 1,
                where: {
                    type: "TOPUP",
                },
            },
        },
    });
    // 🔹 TOTAL COUNT
    const total = yield prisma_1.default.user.count({ where });
    return {
        meta: {
            total,
            page: Number(page),
            limit: Number(limit),
            totalPage: Math.ceil(total / Number(limit)),
        },
        data: users,
    };
});
const getAllUsersFromDB = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const { type, phone, status, organizationId, fromDate, toDate, orderBy = "createdAt", sortOrder = "desc", page = 1, limit = 20, } = query;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);
    // 🔥 WHERE CONDITION
    const where = {};
    if (organizationId) {
        where.organizationId = organizationId;
    }
    // 🔹 Phone filter (user)
    if (phone) {
        where.phone = {
            contains: phone,
        };
    }
    // 🔹 User type filter
    if (status) {
        where.status = status;
    }
    // 🔹 Date filter
    if (fromDate || toDate) {
        where.createdAt = {};
        if (fromDate) {
            const start = new Date(fromDate);
            start.setHours(0, 0, 0, 0); // Diner shuru
            where.createdAt.gte = start;
        }
        if (toDate) {
            const end = new Date(toDate);
            end.setHours(23, 59, 59, 999); // Diner shesh
            where.createdAt.lte = end;
        }
    }
    //  Card type filter
    if (type) {
        where.cards = {
            some: {
                type: type,
            },
        };
    }
    const data = yield prisma_1.default.user.findMany({
        where,
        skip,
        take,
        orderBy: {
            [orderBy]: sortOrder,
        },
        include: {
            cards: true,
            transactions: {
                include: {
                    service: {
                        select: {
                            name: true,
                        }
                    }
                }
            },
        },
    });
    // 🔹 TOTAL COUNT
    const total = yield prisma_1.default.user.count({ where });
    return {
        meta: {
            total,
            page: Number(page),
            limit: Number(limit),
            totalPage: Math.ceil(total / Number(limit)),
        },
        data,
    };
});
const getSingleUserFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma_1.default.user.findUnique({
        where: { id },
        include: {
            cards: true,
            transactions: true,
        },
    });
    if (!user)
        throw new Error("User not found");
    return user;
});
const updateUserInDB = (id, data) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma_1.default.user.findUnique({ where: { id } });
    if (!user)
        throw new Error("User not found");
    return yield prisma_1.default.user.update({
        where: { id },
        data,
    });
});
const deleteUserFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma_1.default.user.findUnique({ where: { id } });
    if (!user)
        throw new Error("User not found");
    return yield prisma_1.default.user.delete({
        where: { id },
    });
});
const checkoutUserFormDB = (id, amount) => __awaiter(void 0, void 0, void 0, function* () {
    const userExists = yield prisma_1.default.user.findUnique({ where: { id } });
    if (!userExists) {
        throw new Error("User not found");
    }
    return yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        // 1️ Find user with card + current balance
        const user = yield tx.user.findUnique({
            where: { id },
            include: {
                cards: true,
            },
        });
        if (!user)
            throw new Error("User not found");
        const card = user.cards[0];
        if (!card)
            throw new Error("No card assigned to user");
        const currentBalance = Number(user.balance);
        // 2️ Balance validation
        // if (amount <= 0) {
        //   throw new Error(`Invalid amount: ${amount}`);
        // }
        // if (currentBalance <= 0) {
        //   throw new Error("Card has no balance");
        // }
        // STRICT RULE (your requirement)
        if (amount !== currentBalance) {
            throw new Error(`Checkout only allowed when amount equals full balance. Available: ${currentBalance}, Requested: ${amount}`);
        }
        const newBalance = currentBalance - amount;
        // 3️ Create TRANSACTION record (DEBIT)
        yield tx.transaction.create({
            data: {
                userId: user.id,
                cardId: card.id,
                type: "REFUND",
                amount: amount,
                balanceBefore: currentBalance,
                balanceAfter: newBalance,
            },
        });
        // 4️ Update card (reset balance)
        yield tx.card.update({
            where: { id: card.id },
            data: {
                status: "INACTIVE",
            },
        });
        // 5️ Update user (deactivate + reset pin)
        yield tx.user.update({
            where: { id },
            data: {
                status: "INACTIVE",
                balance: 0,
                isPinSet: false,
                pinHash: null,
            },
        });
        return;
    }));
});
const applyUserPenaltyFormDB = (userId, organizationId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        // 1️⃣ Get user with card
        const user = yield tx.user.findUnique({
            where: { id: userId },
            include: { cards: true },
        });
        if (!user)
            throw new Error("User not found");
        const card = user.cards[0];
        if (!card)
            throw new Error("No card assigned to user");
        // 2️⃣ Validate card type
        if (card.type !== "NFC" && card.type !== "RFID") {
            throw new Error("Penalty not applicable for this card type");
        }
        // 3️⃣ Get organization penalty fee
        const organization = yield tx.organization.findUnique({
            where: { id: organizationId },
        });
        if (!organization) {
            throw new Error("Organization not found");
        }
        const penaltyAmount = Number(organization.cardDamageFee);
        const currentBalance = Number(user.balance);
        // 4️⃣ Validate balance
        if (currentBalance < penaltyAmount) {
            throw new Error(`Insufficient balance. Required: ${penaltyAmount}, Available: ${currentBalance}`);
        }
        const afterPenaltyBalance = currentBalance - penaltyAmount;
        // 5️⃣ PENALTY TRANSACTION
        yield tx.transaction.create({
            data: {
                userId: user.id,
                cardId: card.id,
                type: "PENALTY",
                amount: penaltyAmount,
                balanceBefore: currentBalance,
                balanceAfter: afterPenaltyBalance,
            },
        });
        // 6️⃣ REFUND LOG (optional business logic)
        const refundAmount = afterPenaltyBalance;
        if (refundAmount > 0) {
            yield tx.transaction.create({
                data: {
                    userId: user.id,
                    cardId: card.id,
                    type: "REFUND",
                    amount: refundAmount,
                    balanceBefore: afterPenaltyBalance,
                    balanceAfter: 0,
                },
            });
        }
        // 7️⃣ Update card → LOST + reset balance
        yield tx.card.update({
            where: { id: card.id },
            data: {
                status: "LOST",
            },
        });
        // 8️⃣ Optional user status update
        yield tx.user.update({
            where: { id: user.id },
            data: {
                balance: 0,
                status: "INACTIVE",
            },
        });
        return {
            success: true,
            message: "Penalty applied successfully",
            data: {
                penaltyAmount,
                refundAmount,
            },
        };
    }));
});
exports.UserServices = {
    createUserWithCard,
    getAllUsersFromDB,
    getSingleUserFromDB,
    updateUserInDB,
    deleteUserFromDB,
    getNewCardIssuedUserFormDB,
    checkoutUserFormDB,
    applyUserPenaltyFormDB,
};
