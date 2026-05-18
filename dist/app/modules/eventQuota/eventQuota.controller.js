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
exports.EventQuotaController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const eventQuota_services_1 = require("./eventQuota.services");
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const createEventQuota = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield eventQuota_services_1.EventQuotaServices.createEventQuota(req.body);
    res.status(http_status_1.default.OK).json({
        success: true,
        message: "Event quota created successfully",
        data: result,
    });
}));
const getAllEventQuota = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield eventQuota_services_1.EventQuotaServices.getAllEventQuota(req.query);
    res.status(http_status_1.default.OK).json({
        success: true,
        message: "Event quota fetched successfully",
        data: result,
    });
}));
const updateEventQuota = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const eventId = req.params.eventId;
    const { services } = req.body;
    if (!eventId) {
        throw new Error("eventId is required");
    }
    if (!Array.isArray(services) || services.length === 0) {
        throw new Error("services must be a non-empty array");
    }
    const result = yield eventQuota_services_1.EventQuotaServices.updateEventQuota({
        eventId,
        services,
    });
    res.status(http_status_1.default.OK).json({
        success: true,
        message: "Event quota updated successfully",
        data: result,
    });
}));
const deleteEventQuota = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield eventQuota_services_1.EventQuotaServices.deleteEventQuota(id);
    res.status(http_status_1.default.OK).json({
        success: true,
        message: "Event quota deleted successfully",
        data: result,
    });
}));
exports.EventQuotaController = {
    createEventQuota,
    getAllEventQuota,
    updateEventQuota,
    deleteEventQuota,
};
