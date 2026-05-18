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
const catchAsync_1 = __importDefault(require("../utils/catchAsync"));
const prisma_1 = __importDefault(require("../utils/prisma"));
const subscriptionGuard = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    // 1. If not authenticated, let auth middleware handle it or proceed
    if (!user) {
        return next();
    }
    // 2. Bypass check for SUPER_ADMIN (they rule the global SaaS platform)
    if (user.role === "SUPER_ADMIN") {
        return next();
    }
    // 3. For tenant staff, check active organization subscription
    if (user.organizationId) {
        const subscription = yield prisma_1.default.subscription.findUnique({
            where: { organizationId: user.organizationId },
        });
        if (!subscription) {
            return res.status(402).json({
                success: false,
                message: "No subscription found. Please contact support or purchase a plan.",
            });
        }
        const now = new Date();
        // If subscription has expired by date, update status to EXPIRED
        if (subscription.endDate < now) {
            if (subscription.status !== "EXPIRED") {
                yield prisma_1.default.subscription.update({
                    where: { id: subscription.id },
                    data: { status: "EXPIRED" },
                });
            }
            return res.status(402).json({
                success: false,
                message: "Your subscription has expired. Please renew your plan to continue using the ERP.",
            });
        }
        // Check for general active/trial status
        if (subscription.status !== "ACTIVE" && subscription.status !== "TRIAL") {
            return res.status(402).json({
                success: false,
                message: `Your subscription is currently ${subscription.status}. Please renew your plan to resume operations.`,
            });
        }
    }
    next();
}));
exports.default = subscriptionGuard;
