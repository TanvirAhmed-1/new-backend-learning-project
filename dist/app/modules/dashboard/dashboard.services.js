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
exports.DashboardServices = void 0;
const prisma_1 = __importDefault(require("../../utils/prisma"));
const getDashboardStatsFromDB = (organizationId, query) => __awaiter(void 0, void 0, void 0, function* () {
    const { startDate, endDate } = query;
    // Build filter for date range in transactions
    const dateFilter = {};
    if (startDate) {
        dateFilter.gte = new Date(startDate);
    }
    if (endDate) {
        // End of day
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        dateFilter.lte = end;
    }
    // Build where conditions
    const transactionWhere = {};
    const eventWhere = {};
    const counterWhere = {};
    const userWhere = {};
    const cardWhere = {};
    const staffWhere = {};
    if (organizationId) {
        transactionWhere.organizationId = organizationId;
        eventWhere.organizationId = organizationId;
        counterWhere.organizationId = organizationId;
        userWhere.organizationId = organizationId;
        cardWhere.organizationId = organizationId;
        staffWhere.organizationId = organizationId;
    }
    if (startDate || endDate) {
        transactionWhere.createdAt = dateFilter;
        eventWhere.startDate = { gte: dateFilter.gte || new Date(0) };
        if (dateFilter.lte) {
            eventWhere.endDate = { lte: dateFilter.lte };
        }
    }
    // 1. Fetch main counts & aggregate totals
    const [totalEvents, totalCounters, totalUsers, totalCards, totalStaffs, transactionSums,] = yield Promise.all([
        prisma_1.default.event.count({ where: eventWhere }),
        prisma_1.default.counter.count({ where: counterWhere }),
        prisma_1.default.user.count({ where: userWhere }),
        prisma_1.default.card.count({ where: cardWhere }),
        prisma_1.default.staff.count({ where: staffWhere }),
        prisma_1.default.transaction.groupBy({
            by: ["type"],
            where: transactionWhere,
            _sum: {
                amount: true,
            },
            _count: {
                id: true,
            },
        }),
    ]);
    // Format transaction totals
    let totalSales = 0;
    let salesCount = 0;
    let totalTopups = 0;
    let topupsCount = 0;
    let totalRefunds = 0;
    let refundsCount = 0;
    let totalPenalties = 0;
    let penaltiesCount = 0;
    transactionSums.forEach((sumGroup) => {
        const amount = Number(sumGroup._sum.amount || 0);
        const count = sumGroup._count.id || 0;
        if (sumGroup.type === "USAGE") {
            totalSales = amount;
            salesCount = count;
        }
        else if (sumGroup.type === "TOPUP") {
            totalTopups = amount;
            topupsCount = count;
        }
        else if (sumGroup.type === "REFUND") {
            totalRefunds = amount;
            refundsCount = count;
        }
        else if (sumGroup.type === "PENALTY") {
            totalPenalties = amount;
            penaltiesCount = count;
        }
    });
    const netBalanceFlow = totalTopups - totalSales - totalRefunds;
    // 2. Fetch User Type distribution (Regular vs Event Users)
    const userTypeDistribution = yield prisma_1.default.user.groupBy({
        by: ["userType"],
        where: userWhere,
        _count: {
            id: true,
        },
    });
    // 3. Card Status distribution
    const cardStatusDistribution = yield prisma_1.default.card.groupBy({
        by: ["status"],
        where: cardWhere,
        _count: {
            id: true,
        },
    });
    // 4. Daily Trend Data (Sales & Topups over time)
    const dailyTransactions = yield prisma_1.default.transaction.findMany({
        where: transactionWhere,
        select: {
            createdAt: true,
            type: true,
            amount: true,
        },
        orderBy: {
            createdAt: "asc",
        },
    });
    const dailyTrendMap = {};
    dailyTransactions.forEach((tx) => {
        const dateStr = tx.createdAt.toISOString().split("T")[0];
        if (!dailyTrendMap[dateStr]) {
            dailyTrendMap[dateStr] = { date: dateStr, sales: 0, topups: 0, count: 0 };
        }
        const amount = Number(tx.amount);
        if (tx.type === "USAGE") {
            dailyTrendMap[dateStr].sales += amount;
        }
        else if (tx.type === "TOPUP") {
            dailyTrendMap[dateStr].topups += amount;
        }
        dailyTrendMap[dateStr].count += 1;
    });
    const trendData = Object.values(dailyTrendMap);
    // 5. Popular Services (Top Selling Items)
    const popularServices = yield prisma_1.default.transaction.groupBy({
        by: ["serviceId"],
        where: Object.assign(Object.assign({}, transactionWhere), { type: "USAGE", serviceId: { not: null } }),
        _sum: {
            amount: true,
        },
        _count: {
            id: true,
        },
        orderBy: {
            _count: {
                id: "desc",
            },
        },
        take: 5,
    });
    const topServices = yield Promise.all(popularServices.map((group) => __awaiter(void 0, void 0, void 0, function* () {
        const service = yield prisma_1.default.service.findUnique({
            where: { id: group.serviceId },
            select: { name: true, price: true },
        });
        return {
            serviceId: group.serviceId,
            name: (service === null || service === void 0 ? void 0 : service.name) || "Unknown Service",
            price: (service === null || service === void 0 ? void 0 : service.price) || 0,
            totalSalesAmount: Number(group._sum.amount || 0),
            transactionCount: group._count.id || 0,
        };
    })));
    // 6. Counter Performance (Sales by Counter)
    const counterPerformance = yield prisma_1.default.transaction.groupBy({
        by: ["counterId"],
        where: Object.assign(Object.assign({}, transactionWhere), { type: "USAGE", counterId: { not: null } }),
        _sum: {
            amount: true,
        },
        _count: {
            id: true,
        },
        orderBy: {
            _sum: {
                amount: "desc",
            },
        },
        take: 5,
    });
    const topCounters = yield Promise.all(counterPerformance.map((group) => __awaiter(void 0, void 0, void 0, function* () {
        const counter = yield prisma_1.default.counter.findUnique({
            where: { id: group.counterId },
            select: { name: true },
        });
        return {
            counterId: group.counterId,
            name: (counter === null || counter === void 0 ? void 0 : counter.name) || "Unknown Counter",
            totalSalesAmount: Number(group._sum.amount || 0),
            transactionCount: group._count.id || 0,
        };
    })));
    return {
        overview: {
            totalEvents,
            totalCounters,
            totalUsers,
            totalCards,
            totalStaffs,
            sales: {
                totalAmount: totalSales,
                count: salesCount,
            },
            topups: {
                totalAmount: totalTopups,
                count: topupsCount,
            },
            refunds: {
                totalAmount: totalRefunds,
                count: refundsCount,
            },
            penalties: {
                totalAmount: totalPenalties,
                count: penaltiesCount,
            },
            netBalanceFlow,
        },
        userTypeDistribution,
        cardStatusDistribution,
        trendData,
        topServices,
        topCounters,
    };
});
exports.DashboardServices = {
    getDashboardStatsFromDB,
};
