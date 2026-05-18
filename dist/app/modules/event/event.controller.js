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
exports.EventController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const event_services_1 = require("./event.services");
const createEvent = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const payload = Object.assign(Object.assign({}, req.body), { creatorId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id });
    if (((_b = req.user) === null || _b === void 0 ? void 0 : _b.role) !== "SUPER_ADMIN") {
        payload.organizationId = (_c = req.user) === null || _c === void 0 ? void 0 : _c.organizationId;
    }
    const result = yield event_services_1.EventService.createEvent(payload);
    res.status(http_status_1.default.OK).json({
        success: true,
        message: "Event created successfully",
        data: result,
    });
}));
const getAllEvent = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const query = Object.assign({}, req.query);
    if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== "SUPER_ADMIN") {
        query.organizationId = ((_b = req.user) === null || _b === void 0 ? void 0 : _b.organizationId) || undefined;
    }
    const result = yield event_services_1.EventService.getAllEvent(query);
    res.status(http_status_1.default.OK).json({
        success: true,
        message: "Events fetched successfully",
        data: result,
    });
}));
const getSingleEventUser = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield event_services_1.EventService.getSingleEventUserFormDB(id);
    res.status(http_status_1.default.OK).json({
        success: true,
        message: "Event Users fetched successfully",
        data: result,
    });
}));
const getSingleEventQuota = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield event_services_1.EventService.getSingleEventQuotaFormDB(id);
    res.status(http_status_1.default.OK).json({
        success: true,
        message: "Event Quota fetched successfully",
        data: result,
    });
}));
const updateEvent = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield event_services_1.EventService.updateEvent(id, req.body);
    res.status(http_status_1.default.OK).json({
        success: true,
        message: "Event updated successfully",
        data: result,
    });
}));
const deleteEvent = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield event_services_1.EventService.deleteEvent(id);
    res.status(http_status_1.default.OK).json({
        success: true,
        message: "Event deleted successfully",
        data: result,
    });
}));
const lockEventController = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield event_services_1.EventService.lockEvent(id);
    res.status(http_status_1.default.OK).json({
        success: true,
        message: "Event locked successfully",
        data: result,
    });
}));
const getEventAnalytics = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const query = Object.assign({}, req.query);
    if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== "SUPER_ADMIN") {
        query.organizationId = ((_b = req.user) === null || _b === void 0 ? void 0 : _b.organizationId) || undefined;
    }
    const result = yield event_services_1.EventService.getEventAnalyticsFormDB(query);
    res.status(http_status_1.default.OK).json({
        success: true,
        message: "Event analytics fetched successfully",
        data: result,
    });
}));
const getSingleEventAnalytics = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield event_services_1.EventService.getSingleEventAnalyticsFormDB(id, req.query);
    res.status(http_status_1.default.OK).json({
        success: true,
        message: "Single event analytics fetched successfully",
        data: result,
    });
}));
const getAllEventUsers = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield event_services_1.EventService.getAllEventUserFormDB(req.query);
    res.status(http_status_1.default.OK).json({
        success: true,
        message: "Event users fetched successfully",
        data: result,
    });
}));
const deleteEventUser = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { eventId, userId } = req.body;
    const result = yield event_services_1.EventService.deleteeventUserFormDB(eventId, userId);
    res.status(http_status_1.default.OK).json({
        success: true,
        message: "Event user removed successfully",
        data: result,
    });
}));
exports.EventController = {
    createEvent,
    getAllEvent,
    getSingleEventUser,
    getSingleEventQuota,
    updateEvent,
    deleteEvent,
    lockEventController,
    getEventAnalytics,
    getAllEventUsers,
    deleteEventUser,
    getSingleEventAnalytics,
};
