import { Request, Response, NextFunction } from "express";
import { CustomError } from "../errors";
import { ZodError } from "zod";
import { MulterError } from "multer";

export const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof CustomError) {
    return res.status(err.statusCode).json(err.serializeErrors());
  }

  if (err instanceof ZodError) {
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

  if (err instanceof MulterError) {
    return res.status(400).json({
      success: false,
      message: err.code === "LIMIT_FILE_SIZE" ? "File size exceeds the allowed limit" : err.message,
    });
  }

  if ((err as any).code === 11000 && (err as any).keyValue) {
    const key = Object.keys((err as any).keyValue)[0];
    const value = (err as any).keyValue[key];
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
    const errors = Object.values((err as any).errors).map((el: any) => ({
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
