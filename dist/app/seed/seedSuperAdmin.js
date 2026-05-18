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
exports.seedSuperAdmin = void 0;
const config_1 = __importDefault(require("../config"));
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new client_1.PrismaClient();
const seedSuperAdmin = () => __awaiter(void 0, void 0, void 0, function* () {
    const existing = yield prisma.staff.findFirst({
        where: {
            role: "SUPER_ADMIN",
        },
    });
    // 👉 already exists → do nothing
    if (existing) {
        console.log("SUPER_ADMIN already exists");
        return;
    }
    const hashedPassword = yield bcrypt_1.default.hash(config_1.default.superAdmin.password, 10);
    yield prisma.staff.create({
        data: {
            name: config_1.default.superAdmin.name,
            email: config_1.default.superAdmin.email,
            phone: config_1.default.superAdmin.phone,
            password: hashedPassword,
            role: "SUPER_ADMIN",
        },
    });
    console.log("SUPER_ADMIN created successfully");
});
exports.seedSuperAdmin = seedSuperAdmin;
