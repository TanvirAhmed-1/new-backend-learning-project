"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CardRoutes = void 0;
const express_1 = require("express");
const card_controller_1 = require("./card.controller");
const requestValidation_1 = __importDefault(require("../../middlewares/requestValidation"));
const card_validation_1 = require("./card.validation");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
router.post("/cards", (0, auth_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN, client_1.Role.MANAGER), (0, requestValidation_1.default)(card_validation_1.createCardSchema), card_controller_1.CardController.createCard);
router.get("/cards", (0, auth_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN, client_1.Role.MANAGER, client_1.Role.OPERATOR), card_controller_1.CardController.getAllCards);
router.get("/card-details/:id", (0, auth_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN, client_1.Role.MANAGER, client_1.Role.OPERATOR), card_controller_1.CardController.getSingleCardDetails);
router.get("/virtual-inactive-card", (0, auth_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN, client_1.Role.MANAGER, client_1.Role.OPERATOR), card_controller_1.CardController.getVirtualInactiveCard);
router.delete("/delete-card/:id", (0, auth_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN), card_controller_1.CardController.deleteCard);
exports.CardRoutes = router;
