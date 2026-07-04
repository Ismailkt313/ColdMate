"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BadRequestError = void 0;
const custom_error_1 = require("./custom.error");
class BadRequestError extends custom_error_1.CustomError {
    constructor(message, errors) {
        super(message);
        this.errors = errors;
        this.statusCode = 400;
    }
    serializeErrors() {
        return {
            success: false,
            message: this.message,
            ...(this.errors && { errors: this.errors }),
        };
    }
}
exports.BadRequestError = BadRequestError;
