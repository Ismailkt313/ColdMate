import { CustomError } from "./custom.error";

export class BadRequestError extends CustomError {
  readonly statusCode = 400;

  constructor(message: string, public errors?: Array<{ message: string; field?: string }>) {
    super(message);
  }

  serializeErrors() {
    return {
      success: false,
      message: this.message,
      ...(this.errors && { errors: this.errors }),
    };
  }
}
