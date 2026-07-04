import { CustomError } from "./custom.error";

export class ForbiddenError extends CustomError {
  readonly statusCode = 403;

  constructor(message: string = "Access forbidden") {
    super(message);
  }

  serializeErrors() {
    return {
      success: false,
      message: this.message,
    };
  }
}
