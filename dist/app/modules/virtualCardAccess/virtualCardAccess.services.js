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
exports.VirtualCardAccessServices = void 0;
const prisma_1 = __importDefault(require("../../utils/prisma"));
const sendSMS_1 = require("../../utils/sendSMS");
const sendVirtualCardSMS = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const record = yield prisma_1.default.virtualCardAccess.findUnique({
        where: { id },
        include: {
            user: true,
            card: true,
        },
    });
    if (!record)
        throw new Error("Record not found");
    if (record.status === "SENT") {
        throw new Error("SMS already sent");
    }
    if (new Date() > record.expiresAt) {
        throw new Error("Link expired");
    }
    const link = `https://your-domain.com/virtual-card?token=${record.token}`;
    const message = `Hi ${record.user.name || "User"}, click to view your virtual card: ${link}`;
    try {
        // 📲 SEND SMS
        yield (0, sendSMS_1.sendSMS)(record.phone, message);
        // ✅ update status
        const updated = yield prisma_1.default.virtualCardAccess.update({
            where: { id },
            data: {
                status: "SENT",
                sentAt: new Date(),
            },
        });
        return updated;
    }
    catch (error) {
        yield prisma_1.default.virtualCardAccess.update({
            where: { id },
            data: {
                status: "FAILED",
                failedAt: new Date(),
            },
        });
        throw new Error("SMS sending failed");
    }
});
const getVirtualFormBD = () => __awaiter(void 0, void 0, void 0, function* () {
    const record = yield prisma_1.default.virtualCardAccess.findMany({
        include: {
            user: true,
            card: true,
        },
    });
    return record;
});
exports.VirtualCardAccessServices = {
    sendVirtualCardSMS,
    getVirtualFormBD,
};
