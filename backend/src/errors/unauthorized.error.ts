import { CustomError } from "./custom.error";

export class UnauthorizedError extends CustomError {
  readonly statusCode = 401;

  constructor(message: string = "Unauthorized access") {
    super(message);
  }

  serializeErrors() {
    return {
      success: false,
      message: this.message,
    };
  }
}
