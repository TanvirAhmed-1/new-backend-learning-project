"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCardSchema = void 0;
const zod_1 = require("zod");
exports.createCardSchema = zod_1.z.object({
    type: zod_1.z.enum(["NFC", "RFID", "VIRTUAL"]),
    cardUid: zod_1.z.string().optional(),
});
