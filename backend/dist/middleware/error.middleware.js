"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMiddleware = void 0;
const errors_1 = require("../errors");
const zod_1 = require("zod");
const errorMiddleware = (err, req, res, next) => {
    if (err instanceof errors_1.CustomError) {
        return res.status(err.statusCode).json(err.serializeErrors());
    }
    if (err instanceof zod_1.ZodError) {
        const formattedErrors = err.errors.map((error) => ({
            field: error.path.join("."),
            message: error.message,
        }));
        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: formattedErrors,
        });
    }
    if (err.code === 11000 && err.keyValue) {
        const key = Object.keys(err.keyValue)[0];
        const value = err.keyValue[key];
        return res.status(400).json({
            success: false,
            message: `A user with this ${key} already exists`,
            errors: [
                {
                    field: key,
                    message: `${key} '${value}' is already taken`,
                },
            ],
        });
    }
    if (err.name === "ValidationError") {
        const errors = Object.values(err.errors).map((el) => ({
            field: el.path,
            message: el.message,
        }));
        return res.status(400).json({
            success: false,
            message: "Database validation failed",
            errors,
        });
    }
    console.error("Unhandled Error Log:", err);
    return res.status(500).json({
        success: false,
        message: "Internal server error",
    });
};
exports.errorMiddleware = errorMiddleware;
