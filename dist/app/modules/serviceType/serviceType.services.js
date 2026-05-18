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
exports.ServiceTypeServices = void 0;
const prisma_1 = __importDefault(require("../../utils/prisma"));
const createServiceTypeInDB = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const isExist = yield prisma_1.default.serviceType.findUnique({
        where: { name: data.name },
    });
    if (isExist) {
        throw new Error("Service type already exists");
    }
    const result = yield prisma_1.default.serviceType.create({
        data: {
            name: data.name,
            organizationId: data.organizationId || null,
        },
    });
    return result;
});
const getAllServiceTypesFromDB = (queryParams) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, organizationId, page = 1, limit = 20, sortBy = "createdAt", sortOrder = "desc", } = queryParams;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);
    const whereCondition = {};
    if (name) {
        whereCondition.name = {
            contains: name,
        };
    }
    if (organizationId) {
        whereCondition.organizationId = organizationId;
    }
    //
    const data = yield prisma_1.default.serviceType.findMany({
        where: whereCondition,
        skip,
        take,
        orderBy: {
            [sortBy]: sortOrder,
        },
        include: {
            _count: {
                select: {
                    service: true,
                },
            },
        },
    });
    const result = data.map((item) => ({
        id: item.id,
        name: item.name,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        totalServices: item._count.service,
    }));
    const total = yield prisma_1.default.serviceType.count({
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
const getSingleServiceTypeFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.serviceType.findUnique({
        where: { id },
    });
    if (!result) {
        throw new Error("Service type not found");
    }
    return result;
});
const updateServiceTypeInDB = (id, data) => __awaiter(void 0, void 0, void 0, function* () {
    const isExist = yield prisma_1.default.serviceType.findUnique({
        where: { id },
    });
    if (!isExist) {
        throw new Error("Service type not found");
    }
    // optional duplicate check
    if (data.name) {
        const duplicate = yield prisma_1.default.serviceType.findUnique({
            where: { name: data.name },
        });
        if (duplicate && duplicate.id !== id) {
            throw new Error("Service type name already exists");
        }
    }
    const result = yield prisma_1.default.serviceType.update({
        where: { id },
        data,
    });
    return result;
});
const deleteServiceTypeFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const isExist = yield prisma_1.default.serviceType.findUnique({
        where: { id },
    });
    if (!isExist) {
        throw new Error("Service type not found");
    }
    const result = yield prisma_1.default.serviceType.delete({
        where: { id },
    });
    return result;
});
exports.ServiceTypeServices = {
    createServiceTypeInDB,
    getAllServiceTypesFromDB,
    getSingleServiceTypeFromDB,
    updateServiceTypeInDB,
    deleteServiceTypeFromDB,
};
