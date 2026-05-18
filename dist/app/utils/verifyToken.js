"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../config"));
const verifyToken = (authToken) => {
    if (!authToken) {
        throw new Error("Unauthorized Access");
    }
    const token = authToken.split(" ")[1];
    const decoded = jsonwebtoken_1.default.verify(token, config_1.default.jwt.secret);
    if (!decoded) {
        throw new Error("Unauthorized Access");
    }
    return decoded;
};
exports.default = verifyToken;
