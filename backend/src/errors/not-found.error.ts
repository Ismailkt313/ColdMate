import { CustomError } from "./custom.error";

export class NotFoundError extends CustomError {
  readonly statusCode = 404;

  constructor(message: string = "Resource not found") {
    super(message);
  }

  serializeErrors() {
    return {
      success: false,
      message: this.message,
    };
  }
}
