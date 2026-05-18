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
exports.DashboardController = void 0;
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const http_status_1 = __importDefault(require("http-status"));
const dashboard_services_1 = require("./dashboard.services");
const getDashboardStats = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const query = Object.assign({}, req.query);
    // Enforce SaaS strict isolation: Non-SUPER_ADMIN staff can only view their own organization's stats.
    let organizationId = undefined;
    if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== "SUPER_ADMIN") {
        organizationId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.organizationId;
    }
    else if (req.query.organizationId) {
        organizationId = req.query.organizationId;
    }
    const result = yield dashboard_services_1.DashboardServices.getDashboardStatsFromDB(organizationId, query);
    res.status(http_status_1.default.OK).json({
        success: true,
        message: "Dashboard analytics statistics fetched successfully",
        data: result,
    });
}));
exports.DashboardController = {
    getDashboardStats,
};
