"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceRoutes = void 0;
const express_1 = require("express");
const requestValidation_1 = __importDefault(require("../../middlewares/requestValidation"));
const service_controller_1 = require("./service.controller");
const service_validation_1 = require("./service.validation");
const fileUploader_1 = require("../../middlewares/fileUploader");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
router.get("/services", (0, auth_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN, client_1.Role.MANAGER, client_1.Role.OPERATOR), service_controller_1.ServiceController.getServices);
router.get("/service/:id", (0, auth_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN, client_1.Role.MANAGER, client_1.Role.OPERATOR), service_controller_1.ServiceController.getSingleService);
router.post("/services", (0, auth_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN, client_1.Role.MANAGER), fileUploader_1.FileUploader.upload("images").single("image"), (req, res, next) => {
    if (req.body.data) {
        try {
            req.body = JSON.parse(req.body.data);
        }
        catch (error) {
            return next(new Error("Invalid JSON object in 'data' field"));
        }
    }
    next();
}, (0, requestValidation_1.default)(service_validation_1.ServiceValidation.createService), service_controller_1.ServiceController.createService);
router.post("/use-service", (0, auth_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN, client_1.Role.MANAGER, client_1.Role.OPERATOR), (0, requestValidation_1.default)(service_validation_1.ServiceValidation.useServiceValidation), service_controller_1.ServiceController.useService);
router.put("/update-service/:id", (0, auth_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN, client_1.Role.MANAGER), (0, requestValidation_1.default)(service_validation_1.ServiceValidation.updateService), service_controller_1.ServiceController.updateService);
router.delete("/delete-service/:id", (0, auth_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN), service_controller_1.ServiceController.deleteService);
exports.ServiceRoutes = router;
