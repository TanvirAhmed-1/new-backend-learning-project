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
exports.CounterServices = void 0;
const prisma_1 = __importDefault(require("../../utils/prisma"));
const createCounterInDB = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const { name } = data;
    const isExist = yield prisma_1.default.counter.findUnique({ where: { name } });
    if (isExist) {
        throw new Error("Counter already exists");
    }
    const result = yield prisma_1.default.counter.create({
        data: {
            name: data.name,
            isActive: data.isActive,
            organizationId: data.organizationId || null,
        },
    });
    return result;
});
// const getAllCountersFromDB = async () => {
//   const counters = await prisma.counter.findMany({
//     include: {
//       service: true,
//     },
//   });
//   const globalServices = await prisma.service.findMany({
//     where: { counterId: null },
//   });
//   return {
//     counters,
//     globalServices: globalServices.map((s) => ({
//       ...s,
//       scope: "GLOBAL",
//     })),
//   };
// };
const getAllCountersFromDB = (queryParams) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, status, organizationId, page = 1, limit = 20, sortBy = "createdAt", sortOrder = "desc", } = queryParams;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);
    const andConditions = [];
    // ১. Name Search (Case-insensitive behavior in MySQL)
    if (name) {
        andConditions.push({
            name: {
                contains: name,
            },
        });
    }
    // ২. Status Filter (isActive)
    if (status !== undefined && status !== "") {
        andConditions.push({
            isActive: status === "true" || status === true,
        });
    }
    // ৩. Organization Filter
    if (organizationId) {
        andConditions.push({
            organizationId,
        });
    }
    const whereCondition = andConditions.length > 0 ? { AND: andConditions } : {};
    const counters = yield prisma_1.default.counter.findMany({
        where: whereCondition,
        skip,
        take,
        orderBy: {
            [sortBy]: sortOrder,
        },
        include: {
            service: true,
            staff: true,
            _count: {
                select: { service: true, staff: true },
            },
        },
    });
    const globalServices = yield prisma_1.default.service.findMany({
        where: {
            counterId: null,
            isActive: true,
            OR: organizationId ? [
                { organizationId },
                { organizationId: null }
            ] : undefined
        },
    });
    const total = yield prisma_1.default.counter.count({
        where: whereCondition,
    });
    return {
        meta: {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPage: Math.ceil(total / Number(limit)),
        },
        data: {
            counters,
            globalServices: globalServices.map((s) => (Object.assign(Object.assign({}, s), { scope: s.organizationId ? "ORGANIZATION" : "GLOBAL" }))),
        },
    };
});
const getSingleCounterFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.counter.findUnique({
        where: { id },
        include: { staff: true },
    });
    return result;
});
const updateCounterInDB = (id, data) => __awaiter(void 0, void 0, void 0, function* () {
    const isExist = yield prisma_1.default.counter.findUnique({ where: { id } });
    if (!isExist) {
        throw new Error("Counter not found");
    }
    const result = yield prisma_1.default.counter.update({
        where: { id },
        data,
    });
    return result;
});
const deleteCounterFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const isExist = yield prisma_1.default.counter.findUnique({ where: { id } });
    if (!isExist) {
        throw new Error("Counter not found");
    }
    const result = yield prisma_1.default.counter.delete({
        where: { id },
    });
    return result;
});
exports.CounterServices = {
    createCounterInDB,
    getAllCountersFromDB,
    getSingleCounterFromDB,
    updateCounterInDB,
    deleteCounterFromDB,
};
