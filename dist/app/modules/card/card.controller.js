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
exports.CardController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const card_services_1 = require("./card.services");
const createCard = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const payload = Object.assign({}, req.body);
    if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== "SUPER_ADMIN") {
        payload.organizationId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.organizationId;
    }
    const result = yield card_services_1.CardServices.createCardInDB(payload);
    res.status(http_status_1.default.CREATED).json({
        success: true,
        message: "Card created successfully",
        data: result,
    });
}));
const getAllCards = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const query = Object.assign({}, req.query);
    if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== "SUPER_ADMIN") {
        query.organizationId = ((_b = req.user) === null || _b === void 0 ? void 0 : _b.organizationId) || undefined;
    }
    const result = yield card_services_1.CardServices.getAllCardFormDB(query);
    res.status(http_status_1.default.OK).json({
        success: true,
        message: "Cards fetched successfully",
        data: result,
    });
}));
const getSingleCardDetails = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield card_services_1.CardServices.getSingleCardDetailsFromDB(id);
    res.status(http_status_1.default.OK).json({
        success: true,
        message: "this Card Transaction fetched successfully",
        data: result,
    });
}));
const getVirtualInactiveCard = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const query = {};
    if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== "SUPER_ADMIN") {
        query.organizationId = ((_b = req.user) === null || _b === void 0 ? void 0 : _b.organizationId) || undefined;
    }
    const result = yield card_services_1.CardServices.getVirtualInactiveCardFromDB(query);
    res.status(http_status_1.default.OK).json({
        success: true,
        message: "the Virtual Card fetched successfully",
        data: result,
    });
}));
const deleteCard = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield card_services_1.CardServices.deleteCardFromDB(id);
    res.status(http_status_1.default.OK).json({
        success: true,
        message: "Card deleted successfully",
        data: result,
    });
}));
exports.CardController = {
    createCard,
    getAllCards,
    getSingleCardDetails,
    getVirtualInactiveCard,
    deleteCard,
};
