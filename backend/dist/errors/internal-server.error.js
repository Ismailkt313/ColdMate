"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InternalServerError = void 0;
const custom_error_1 = require("./custom.error");
class InternalServerError extends custom_error_1.CustomError {
    constructor(message = "Internal server error") {
        super(message);
        this.statusCode = 500;
    }
    serializeErrors() {
        return {
            success: false,
            message: this.message,
        };
    }
}
exports.InternalServerError = InternalServerError;
