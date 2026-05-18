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
exports.OrganizationServices = void 0;
const prisma_1 = __importDefault(require("../../utils/prisma"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const getOrganizationFormDB = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.organization.findMany({
        include: {
            creator: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                },
            },
            _count: {
                select: {
                    staffs: true,
                    events: true,
                    users: true,
                    counters: true,
                },
            },
        },
    });
    return result;
});
const CreateOrganizationInDB = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const isExist = yield prisma_1.default.organization.findUnique({
        where: {
            name: data.name,
        },
    });
    if (isExist) {
        throw new Error("Organization already exists");
    }
    const result = yield prisma_1.default.organization.create({
        data: {
            name: data.name,
            cardDamageFee: data.cardDamageFee,
            country: data.country,
            creatorId: data.creatorId,
        },
    });
    return result;
});
const updateOrganizationInDB = (id, data) => __awaiter(void 0, void 0, void 0, function* () {
    const isExist = yield prisma_1.default.organization.findUnique({
        where: {
            id,
        },
    });
    if (!isExist) {
        throw new Error("Organization not found");
    }
    const result = yield prisma_1.default.organization.update({
        where: {
            id,
        },
        data: {
            name: data.name,
            cardDamageFee: data.cardDamageFee,
            country: data.country,
            creatorId: data.creatorId,
        },
    });
    return result;
});
const deleteOrganizationInDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const isExist = yield prisma_1.default.organization.findUnique({
        where: {
            id,
        },
    });
    if (!isExist) {
        throw new Error("Organization not found");
    }
    const result = yield prisma_1.default.organization.delete({
        where: {
            id,
        },
    });
    return result;
});
const registerTenantInDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { orgName, cardDamageFee, adminName, adminEmail, adminPhone, adminPassword } = payload;
    // 1. Check if organization already exists
    const orgExists = yield prisma_1.default.organization.findUnique({
        where: { name: orgName },
    });
    if (orgExists) {
        throw new Error("Organization name already taken!");
    }
    // 2. Check if staff email already exists
    const staffExists = yield prisma_1.default.staff.findUnique({
        where: { email: adminEmail },
    });
    if (staffExists) {
        throw new Error("An administrator staff with this email already exists!");
    }
    // 3. Hash password
    const hashedPassword = yield bcrypt_1.default.hash(adminPassword, 10);
    // 4. Atomic database transaction
    const result = yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        // Create Organization
        const newOrg = yield tx.organization.create({
            data: {
                name: orgName,
                cardDamageFee: cardDamageFee || 0,
            },
        });
        // Create Admin Staff
        const newStaff = yield tx.staff.create({
            data: {
                name: adminName,
                email: adminEmail,
                phone: adminPhone,
                password: hashedPassword,
                role: "ADMIN",
                organizationId: newOrg.id,
            },
        });
        // Link organization creator to the newly created admin staff
        const updatedOrg = yield tx.organization.update({
            where: { id: newOrg.id },
            data: {
                creatorId: newStaff.id,
            },
        });
        // Check if subscription plan exists, else create default Trial Plan
        let plan = yield tx.subscriptionPlan.findFirst({
            where: { name: "Trial Plan" },
        });
        if (!plan) {
            plan = yield tx.subscriptionPlan.create({
                data: {
                    name: "Trial Plan",
                    description: "30 Days Free Trial on signup",
                    price: 0,
                    billingCycle: "MONTHLY",
                    maxUsers: 100,
                    maxEvents: 10,
                    maxStaffs: 10,
                    isActive: true,
                },
            });
        }
        // Auto-create a 30-day Free Trial subscription so tenant isn't locked out
        const subscription = yield tx.subscription.create({
            data: {
                organizationId: newOrg.id,
                planId: plan.id,
                status: "TRIAL",
                startDate: new Date(),
                endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days free trial
            },
        });
        return {
            organization: updatedOrg,
            admin: {
                id: newStaff.id,
                name: newStaff.name,
                email: newStaff.email,
                role: newStaff.role,
            },
            subscription,
        };
    }));
    return result;
});
exports.OrganizationServices = {
    getOrganizationFormDB,
    CreateOrganizationInDB,
    updateOrganizationInDB,
    deleteOrganizationInDB,
    registerTenantInDB,
};
