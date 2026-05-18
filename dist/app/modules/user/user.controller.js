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
exports.UserController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const user_services_1 = require("./user.services");
const createUser = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const payload = Object.assign({}, req.body);
    if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== "SUPER_ADMIN") {
        payload.organizationId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.organizationId;
    }
    const result = yield user_services_1.UserServices.createUserWithCard(payload);
    res.status(http_status_1.default.CREATED).json({
        success: true,
        message: "User created successfully",
        data: result,
    });
}));
const getAllUsers = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const query = Object.assign({}, req.query);
    if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== "SUPER_ADMIN") {
        query.organizationId = ((_b = req.user) === null || _b === void 0 ? void 0 : _b.organizationId) || undefined;
    }
    const result = yield user_services_1.UserServices.getAllUsersFromDB(query);
    res.status(http_status_1.default.OK).json({
        success: true,
        message: "Users fetched successfully",
        data: result,
    });
}));
const getSingleUser = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield user_services_1.UserServices.getSingleUserFromDB(id);
    res.status(http_status_1.default.OK).json({
        success: true,
        message: "User fetched successfully",
        data: result,
    });
}));
const updateUser = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield user_services_1.UserServices.updateUserInDB(id, req.body);
    res.status(http_status_1.default.OK).json({
        success: true,
        message: "User updated successfully",
        data: result,
    });
}));
const deleteUser = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield user_services_1.UserServices.deleteUserFromDB(id);
    res.status(http_status_1.default.OK).json({
        success: true,
        message: "User deleted successfully",
        data: result,
    });
}));
const getNewCardIssuedUser = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const query = Object.assign({}, req.query);
    if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== "SUPER_ADMIN") {
        query.organizationId = ((_b = req.user) === null || _b === void 0 ? void 0 : _b.organizationId) || undefined;
    }
    const result = yield user_services_1.UserServices.getNewCardIssuedUserFormDB(query);
    res.status(http_status_1.default.OK).json({
        success: true,
        message: "User fetched successfully",
        data: result,
    });
}));
const checkoutUser = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId: id, amount } = req.body;
    const result = yield user_services_1.UserServices.checkoutUserFormDB(id, amount);
    res.status(http_status_1.default.OK).json({
        success: true,
        message: "User checked out successfully",
        data: result,
    });
}));
const applyUserPenalty = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { userId } = req.body;
    let organizationId = req.body.organizationId;
    if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== "SUPER_ADMIN") {
        organizationId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.organizationId;
    }
    const result = yield user_services_1.UserServices.applyUserPenaltyFormDB(userId, organizationId);
    res.status(http_status_1.default.OK).json({
        success: true,
        message: "Penalty applied successfully",
        data: result,
    });
}));
exports.UserController = {
    createUser,
    getAllUsers,
    getSingleUser,
    updateUser,
    deleteUser,
    getNewCardIssuedUser,
    checkoutUser,
    applyUserPenalty,
};
