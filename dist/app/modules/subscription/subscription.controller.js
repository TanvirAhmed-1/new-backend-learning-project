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
exports.SubscriptionController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const subscription_services_1 = require("./subscription.services");
const createPlan = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield subscription_services_1.SubscriptionServices.createPlanInDB(req.body);
    res.status(http_status_1.default.CREATED).json({
        success: true,
        message: "Subscription plan created successfully",
        data: result,
    });
}));
const getAllPlans = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield subscription_services_1.SubscriptionServices.getAllPlansFromDB();
    res.status(http_status_1.default.OK).json({
        success: true,
        message: "Subscription plans fetched successfully",
        data: result,
    });
}));
const buySubscription = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const payload = Object.assign({}, req.body);
    // Tenant locking - non-super admins can only purchase for their own organization
    if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== "SUPER_ADMIN") {
        payload.organizationId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.organizationId;
    }
    else if (!payload.organizationId) {
        throw new Error("organizationId is required for SUPER_ADMIN purchases");
    }
    const result = yield subscription_services_1.SubscriptionServices.buySubscriptionInDB(payload);
    res.status(http_status_1.default.OK).json({
        success: true,
        message: "Subscription purchased successfully",
        data: result,
    });
}));
const getOrganizationSubscription = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    let orgId = req.params.orgId;
    // Tenant locking
    if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== "SUPER_ADMIN") {
        orgId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.organizationId;
    }
    if (!orgId) {
        throw new Error("orgId parameter is required");
    }
    const result = yield subscription_services_1.SubscriptionServices.getOrganizationSubscriptionFromDB(orgId);
    res.status(http_status_1.default.OK).json({
        success: true,
        message: "Subscription status fetched successfully",
        data: result,
    });
}));
exports.SubscriptionController = {
    createPlan,
    getAllPlans,
    buySubscription,
    getOrganizationSubscription,
};
