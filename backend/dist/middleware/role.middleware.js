"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roleMiddleware = void 0;
const errors_1 = require("../errors");
const roleMiddleware = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new errors_1.UnauthorizedError("Authentication required"));
        }
        if (!allowedRoles.includes(req.user.role)) {
            return next(new errors_1.ForbiddenError("Access denied: Insufficient permissions"));
        }
        next();
    };
};
exports.roleMiddleware = roleMiddleware;
