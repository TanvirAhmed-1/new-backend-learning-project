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
const verifyToken_1 = __importDefault(require("../utils/verifyToken"));
const prisma_1 = __importDefault(require("../utils/prisma"));
const auth = (...roles) => {
    return (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const token = req.headers.authorization;
        if (!token) {
            throw new Error("Unauthorized Access! Token is missing.");
        }
        const decoded = (0, verifyToken_1.default)(token);
        req.user = decoded;
        if (roles.length && !roles.includes(decoded.role)) {
            throw new Error("Forbidden Access! You do not have permission.");
        }
        // ==========================================
        // SAAS SUBSCRIPTION CHECK
        // ==========================================
        // Bypass for SUPER_ADMIN or subscription endpoints (to allow renewal/purchasing)
        const isSubscriptionRoute = req.originalUrl.includes("/plans") ||
            req.originalUrl.includes("/buy") ||
            req.originalUrl.includes("/status");
        if (decoded.role !== "SUPER_ADMIN" && !isSubscriptionRoute && decoded.organizationId) {
            const subscription = yield prisma_1.default.subscription.findUnique({
                where: { organizationId: decoded.organizationId },
            });
            if (!subscription) {
                return res.status(402).json({
                    success: false,
                    message: "No subscription found. Please contact support or purchase a plan.",
                });
            }
            const now = new Date();
            // Auto expire subscription if endDate is in the past
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
            // Block access for non-active and non-trial subscriptions
            if (subscription.status !== "ACTIVE" && subscription.status !== "TRIAL") {
                return res.status(402).json({
                    success: false,
                    message: `Your subscription is currently ${subscription.status}. Please renew your plan to resume operations.`,
                });
            }
        }
        next();
    }));
};
exports.default = auth;
