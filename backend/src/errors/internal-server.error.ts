import { CustomError } from "./custom.error";

export class InternalServerError extends CustomError {
  readonly statusCode = 500;

  constructor(message: string = "Internal server error") {
    super(message);
  }

  serializeErrors() {
    return {
      success: false,
      message: this.message,
    };
  }
}
