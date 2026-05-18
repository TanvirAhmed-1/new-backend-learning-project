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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StaffServices = exports.loginUser = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma_1 = __importDefault(require("../../utils/prisma"));
const createToken_1 = require("../../utils/createToken ");
const getStaffFromDB = (queryParams) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, phone, organizationId, page = 1, limit = 20, sortBy = "createdAt", sortOrder = "desc", } = queryParams;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);
    const whereCondition = {};
    if (name) {
        whereCondition.name = {
            contains: name,
        };
    }
    if (email) {
        whereCondition.email = {
            contains: email,
        };
    }
    if (phone) {
        whereCondition.phone = {
            contains: phone,
        };
    }
    if (organizationId) {
        whereCondition.organizationId = organizationId;
    }
    // 🔹 Query
    const data = yield prisma_1.default.staff.findMany({
        where: whereCondition,
        skip,
        take,
        orderBy: {
            [sortBy]: sortOrder,
        },
        include: {
            counter: true, //  include counter info
            _count: {
                select: {
                    services: true,
                    transactions: true,
                },
            },
        },
    });
    // 🔹 Clean response (remove password 🔥)
    const result = data.map((item) => ({
        id: item.id,
        name: item.name,
        email: item.email,
        phone: item.phone,
        role: item.role,
        password: item.password,
        isActive: item.isActive,
        counter: item.counter
            ? {
                id: item.counter.id,
                name: item.counter.name,
            }
            : null,
        totalServices: item._count.services,
        totalTransactions: item._count.transactions,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
    }));
    // 🔹 Total count
    const total = yield prisma_1.default.staff.count({
        where: whereCondition,
    });
    return {
        meta: {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPage: Math.ceil(total / Number(limit)),
        },
        data: result,
    };
});
const getSingleStaffFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const isExist = yield prisma_1.default.staff.findUnique({ where: { id } });
    if (!isExist) {
        throw new Error("Staff not found");
    }
    const result = yield prisma_1.default.staff.findUnique({ where: { id } });
    return result;
});
const createStaffInDB = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, phone, password } = data, rest = __rest(data, ["email", "phone", "password"]);
    const phoneExist = yield prisma_1.default.staff.findUnique({ where: { phone } });
    if (phoneExist) {
        throw new Error("Phone number already exists");
    }
    const emailExist = yield prisma_1.default.staff.findUnique({ where: { email } });
    if (emailExist) {
        throw new Error("Email already exists");
    }
    const hashedPassword = yield bcrypt_1.default.hash(password, 10);
    const result = yield prisma_1.default.staff.create({
        data: Object.assign(Object.assign({}, rest), { email,
            phone, password: hashedPassword }),
    });
    return result;
});
const updateStaffInDB = (id, data) => __awaiter(void 0, void 0, void 0, function* () {
    const isExist = yield prisma_1.default.staff.findUnique({ where: { id } });
    if (!isExist) {
        throw new Error("Staff not found");
    }
    const result = yield prisma_1.default.staff.update({
        where: { id },
        data,
    });
    return result;
});
const deleteStaffFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const isExist = yield prisma_1.default.staff.findUnique({ where: { id } });
    if (!isExist) {
        throw new Error("Staff not found");
    }
    const result = yield prisma_1.default.staff.delete({ where: { id } });
    return result;
});
const loginUser = (email, password) => __awaiter(void 0, void 0, void 0, function* () {
    // 1. find user
    const user = yield prisma_1.default.staff.findUnique({
        where: { email },
    });
    if (!user) {
        throw new Error("User not found");
    }
    // 2. password check
    const isMatch = yield bcrypt_1.default.compare(password, user.password);
    if (!isMatch) {
        throw new Error("Invalid credentials");
    }
    const tokenPayload = {
        id: user.id,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
    };
    // 3. create token
    const token = (0, createToken_1.createToken)(tokenPayload);
    return {
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            organizationId: user.organizationId,
        },
    };
});
exports.loginUser = loginUser;
exports.StaffServices = {
    getStaffFromDB,
    getSingleStaffFromDB,
    createStaffInDB,
    deleteStaffFromDB,
    updateStaffInDB,
    loginUser: exports.loginUser,
};
