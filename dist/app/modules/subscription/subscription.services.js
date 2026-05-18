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
exports.SubscriptionServices = void 0;
const prisma_1 = __importDefault(require("../../utils/prisma"));
const createPlanInDB = (data) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    const isExist = yield prisma_1.default.subscriptionPlan.findUnique({
        where: { name: data.name },
    });
    if (isExist) {
        throw new Error("Subscription plan with this name already exists");
    }
    const result = yield prisma_1.default.subscriptionPlan.create({
        data: {
            name: data.name,
            description: (_a = data.description) !== null && _a !== void 0 ? _a : null,
            price: data.price,
            billingCycle: data.billingCycle || "MONTHLY",
            maxUsers: (_b = data.maxUsers) !== null && _b !== void 0 ? _b : 100,
            maxEvents: (_c = data.maxEvents) !== null && _c !== void 0 ? _c : 10,
            maxStaffs: (_d = data.maxStaffs) !== null && _d !== void 0 ? _d : 10,
        },
    });
    return result;
});
const getAllPlansFromDB = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.subscriptionPlan.findMany({
        where: { isActive: true },
        orderBy: { price: "asc" },
    });
    return result;
});
const buySubscriptionInDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { organizationId, planId, paymentMethod, transactionId } = payload;
    // 1. Fetch Subscription Plan
    const plan = yield prisma_1.default.subscriptionPlan.findUnique({
        where: { id: planId },
    });
    if (!plan) {
        throw new Error("Selected Subscription Plan not found");
    }
    // 2. Fetch Organization
    const organization = yield prisma_1.default.organization.findUnique({
        where: { id: organizationId },
    });
    if (!organization) {
        throw new Error("Organization not found");
    }
    const now = new Date();
    return yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        // Check if subscription already exists
        const currentSubscription = yield tx.subscription.findUnique({
            where: { organizationId },
        });
        let startDate = now;
        let endDate = new Date();
        // Determine the billing duration
        const daysToAdd = plan.billingCycle === "YEARLY" ? 365 : 30;
        if (currentSubscription) {
            // If active subscription exists and is not expired, accumulate/stack the period!
            const currentEndDate = new Date(currentSubscription.endDate);
            const baseDate = currentEndDate > now ? currentEndDate : now;
            startDate = currentSubscription.startDate;
            endDate = new Date(baseDate.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
        }
        else {
            endDate = new Date(now.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
        }
        // 3. Upsert Subscription
        const subscription = yield tx.subscription.upsert({
            where: { organizationId },
            update: {
                planId,
                status: "ACTIVE",
                endDate,
            },
            create: {
                organizationId,
                planId,
                status: "ACTIVE",
                startDate,
                endDate,
            },
        });
        // 4. Log Payment history
        const payment = yield tx.subscriptionPayment.create({
            data: {
                subscriptionId: subscription.id,
                amount: plan.price,
                status: "SUCCESS",
                paymentMethod,
                transactionId,
                billingPeriodStart: now,
                billingPeriodEnd: endDate,
            },
        });
        return {
            subscription,
            payment,
        };
    }));
});
const getOrganizationSubscriptionFromDB = (organizationId) => __awaiter(void 0, void 0, void 0, function* () {
    const subscription = yield prisma_1.default.subscription.findUnique({
        where: { organizationId },
        include: {
            plan: true,
            payments: {
                orderBy: { createdAt: "desc" },
            },
        },
    });
    if (!subscription) {
        return {
            status: "NO_SUBSCRIPTION",
            message: "This organization has no subscription record yet.",
            subscription: null,
        };
    }
    return {
        status: subscription.status,
        subscription,
    };
});
exports.SubscriptionServices = {
    createPlanInDB,
    getAllPlansFromDB,
    buySubscriptionInDB,
    getOrganizationSubscriptionFromDB,
};
