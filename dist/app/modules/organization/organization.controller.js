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
exports.OrganizationController = void 0;
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const organization_services_1 = require("./organization.services");
const http_status_1 = __importDefault(require("http-status"));
const getOrganization = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const result = yield organization_services_1.OrganizationServices.getOrganizationFormDB();
    // Enforce SaaS strict tenancy check
    const filteredData = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) === "SUPER_ADMIN"
        ? result
        : result.filter((org) => { var _a; return org.id === ((_a = req.user) === null || _a === void 0 ? void 0 : _a.organizationId); });
    res.status(http_status_1.default.OK).json({
        success: true,
        message: "Organization fetched successfully",
        data: filteredData,
    });
}));
const CreateOrganization = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const payload = Object.assign(Object.assign({}, req.body), { creatorId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id });
    const result = yield organization_services_1.OrganizationServices.CreateOrganizationInDB(payload);
    res.status(http_status_1.default.OK).json({
        success: true,
        message: "Organization created successfully",
        data: result,
    });
}));
const updateOrganization = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield organization_services_1.OrganizationServices.updateOrganizationInDB(id, req.body);
    res.status(http_status_1.default.OK).json({
        success: true,
        message: "Organization updated successfully",
        data: result,
    });
}));
const deleteOrganization = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield organization_services_1.OrganizationServices.deleteOrganizationInDB(id);
    res.status(http_status_1.default.OK).json({
        success: true,
        message: "Organization deleted successfully",
        data: result,
    });
}));
const registerTenant = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield organization_services_1.OrganizationServices.registerTenantInDB(req.body);
    res.status(http_status_1.default.CREATED).json({
        success: true,
        message: "Tenant registered successfully! A 30-day Free Trial has been activated.",
        data: result,
    });
}));
exports.OrganizationController = {
    getOrganization,
    CreateOrganization,
    updateOrganization,
    deleteOrganization,
    registerTenant,
};
