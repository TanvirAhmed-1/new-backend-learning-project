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
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateUniqueCardData = exports.generateCardCode = exports.updateVisit = exports.getToday = void 0;
const crypto_1 = require("crypto");
const getToday = () => new Date().toISOString().split("T")[0];
exports.getToday = getToday;
const updateVisit = (existing) => {
    const today = (0, exports.getToday)();
    const visits = existing && typeof existing === "object" ? existing : {};
    visits[today] = (visits[today] || 0) + 1;
    return visits;
};
exports.updateVisit = updateVisit;
// card
const generateCardUid = () => {
    return (0, crypto_1.randomBytes)(7).toString("hex").toUpperCase();
};
const generateCardCode = () => {
    return `C-${(0, crypto_1.randomBytes)(4).toString("hex").toUpperCase()}`;
};
exports.generateCardCode = generateCardCode;
const generateUniqueCardData = (tx) => __awaiter(void 0, void 0, void 0, function* () {
    let cardUid;
    let cardCode;
    let exists = true;
    while (exists) {
        cardUid = generateCardUid();
        cardCode = (0, exports.generateCardCode)();
        const found = yield tx.card.findFirst({
            where: {
                OR: [{ cardUid }, { cardCode }],
            },
        });
        if (!found) {
            exists = false;
        }
    }
    return { cardUid, cardCode };
});
exports.generateUniqueCardData = generateUniqueCardData;
