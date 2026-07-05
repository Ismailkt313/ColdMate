import { CustomError } from "./custom.error";

export class DocumentValidationError extends CustomError {
  readonly statusCode = 400;

  constructor(message: string, public documentType: string) {
    super(message);
  }

  serializeErrors() {
    return {
      success: false,
      message: this.message,
      documentType: this.documentType,
    };
  }
}
