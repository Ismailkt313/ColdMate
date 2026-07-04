"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnauthorizedError = void 0;
const custom_error_1 = require("./custom.error");
class UnauthorizedError extends custom_error_1.CustomError {
    constructor(message = "Unauthorized access") {
        super(message);
        this.statusCode = 401;
    }
    serializeErrors() {
        return {
            success: false,
            message: this.message,
        };
    }
}
exports.UnauthorizedError = UnauthorizedError;
