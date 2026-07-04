"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotFoundError = void 0;
const custom_error_1 = require("./custom.error");
class NotFoundError extends custom_error_1.CustomError {
    constructor(message = "Resource not found") {
        super(message);
        this.statusCode = 404;
    }
    serializeErrors() {
        return {
            success: false,
            message: this.message,
        };
    }
}
exports.NotFoundError = NotFoundError;
