"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const errors_1 = require("../errors");
const jwt_utils_1 = require("../utils/jwt.utils");
const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new errors_1.UnauthorizedError("Access token required");
        }
        const token = authHeader.split(" ")[1];
        const decoded = jwt_utils_1.JwtUtils.verifyAccessToken(token);
        req.user = decoded;
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.authMiddleware = authMiddleware;
