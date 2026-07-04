"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiResponse = void 0;
class ApiResponse {
    static success(res, message, data = {}, statusCode = 200) {
        return res.status(statusCode).json({
            success: true,
            message,
            data,
        });
    }
    static error(res, message, errors = null, statusCode = 500) {
        return res.status(statusCode).json({
            success: false,
            message,
            ...(errors && { errors }),
        });
    }
}
exports.ApiResponse = ApiResponse;
