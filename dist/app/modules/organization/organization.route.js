"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganizationRouter = void 0;
const express_1 = require("express");
const requestValidation_1 = __importDefault(require("../../middlewares/requestValidation"));
const organization_validation_1 = require("./organization.validation");
const organization_controller_1 = require("./organization.controller");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
router.post("/organizations/register", (0, requestValidation_1.default)(organization_validation_1.registerTenantValidation), organization_controller_1.OrganizationController.registerTenant);
router.get("/organizations", (0, auth_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN, client_1.Role.MANAGER, client_1.Role.OPERATOR), organization_controller_1.OrganizationController.getOrganization);
router.post("/organizations", (0, auth_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN, client_1.Role.MANAGER, client_1.Role.OPERATOR), (0, requestValidation_1.default)(organization_validation_1.createOrganization), organization_controller_1.OrganizationController.CreateOrganization);
router.put("/update-organization/:id", (0, auth_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN, client_1.Role.MANAGER), (0, requestValidation_1.default)(organization_validation_1.createOrganization), organization_controller_1.OrganizationController.updateOrganization);
router.delete("/delete-organization/:id", (0, auth_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN), organization_controller_1.OrganizationController.deleteOrganization);
exports.OrganizationRouter = router;
