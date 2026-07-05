export abstract class CustomError extends Error {
  abstract readonly statusCode: number;

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }

  abstract serializeErrors(): {
    success: boolean;
    message: string;
    errors?: Array<{ message: string; field?: string }>;
    documentType?: string;
  };
}
