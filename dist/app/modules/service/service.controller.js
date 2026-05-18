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
exports.ServiceController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const service_services_1 = require("./service.services");
const fileUploader_1 = require("../../middlewares/fileUploader");
const createService = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const payload = req.body;
    const request = req;
    if (request.file) {
        const { relativePath } = yield fileUploader_1.FileUploader.processImage(request.file, "images");
        payload.image = relativePath;
    }
    if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== "SUPER_ADMIN") {
        payload.organizationId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.organizationId;
    }
    const result = yield service_services_1.ServiceServices.createServiceInDB(payload);
    res.status(http_status_1.default.OK).json({
        success: true,
        message: "Service created successfully",
        data: result,
    });
}));
const getServices = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const query = Object.assign({}, req.query);
    if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== "SUPER_ADMIN") {
        query.organizationId = ((_b = req.user) === null || _b === void 0 ? void 0 : _b.organizationId) || undefined;
    }
    const result = yield service_services_1.ServiceServices.getServicesFromDB(query);
    res.status(http_status_1.default.OK).json({
        success: true,
        message: "Services fetched successfully",
        data: result,
    });
}));
const getSingleService = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield service_services_1.ServiceServices.getSingleServiceFromDB(id);
    res.status(http_status_1.default.OK).json({
        success: true,
        message: "Service fetched successfully",
        data: result,
    });
}));
const updateService = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield service_services_1.ServiceServices.updateServiceInDB(id, req.body);
    res.status(http_status_1.default.OK).json({
        success: true,
        message: "Service updated successfully",
        data: result,
    });
}));
const deleteService = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield service_services_1.ServiceServices.deleteServiceFromDB(id);
    res.status(http_status_1.default.OK).json({
        success: true,
        message: "Service deleted successfully",
        data: result,
    });
}));
const useService = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(req.body);
    const result = yield service_services_1.ServiceServices.useServiceFromDB(req.body);
    res.status(http_status_1.default.OK).json({
        success: true,
        message: "Service used successfully",
        data: result,
    });
}));
exports.ServiceController = {
    createService,
    getServices,
    getSingleService,
    useService,
    updateService,
    deleteService,
};
