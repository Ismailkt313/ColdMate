"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtUtils = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const errors_1 = require("../errors");
class JwtUtils {
    static generateAccessToken(payload) {
        const secret = process.env.JWT_ACCESS_SECRET || "coldmate_access_secret_key_2026";
        const expiresIn = process.env.JWT_ACCESS_EXPIRES_IN || "15m";
        return jsonwebtoken_1.default.sign(payload, secret, { expiresIn: expiresIn });
    }
    static generateRefreshToken(payload) {
        const secret = process.env.JWT_REFRESH_SECRET || "coldmate_refresh_secret_key_2026";
        const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || "7d";
        return jsonwebtoken_1.default.sign(payload, secret, { expiresIn: expiresIn });
    }
    static verifyAccessToken(token) {
        try {
            const secret = process.env.JWT_ACCESS_SECRET || "coldmate_access_secret_key_2026";
            return jsonwebtoken_1.default.verify(token, secret);
        }
        catch (error) {
            throw new errors_1.UnauthorizedError("Invalid or expired access token");
        }
    }
    static verifyRefreshToken(token) {
        try {
            const secret = process.env.JWT_REFRESH_SECRET || "coldmate_refresh_secret_key_2026";
            return jsonwebtoken_1.default.verify(token, secret);
        }
        catch (error) {
            throw new errors_1.UnauthorizedError("Invalid or expired refresh token");
        }
    }
}
exports.JwtUtils = JwtUtils;
