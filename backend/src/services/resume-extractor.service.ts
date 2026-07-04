// pdf-parse v1.1.1 uses module.exports = fn (CJS); require() returns the function directly
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require("pdf-parse") as (buffer: Buffer, options?: Record<string, unknown>) => Promise<{ text: string }>;
import mammoth from "mammoth";
import { BadRequestError } from "../errors";

export class ResumeExtractorService {
  static async extractText(buffer: Buffer, mimetype: string): Promise<string> {
    if (mimetype === "application/pdf") {
      return ResumeExtractorService.extractFromPdf(buffer);
    }

    if (
      mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      return ResumeExtractorService.extractFromDocx(buffer);
    }

    throw new BadRequestError("Unsupported file type for text extraction");
  }

  private static async extractFromPdf(buffer: Buffer): Promise<string> {
    try {
      const data = await pdfParse(buffer);
      const text = data.text?.trim();
      if (!text) {
        throw new BadRequestError("Could not extract text from the PDF. Please ensure the file is not image-only.");
      }
      return text;
    } catch (error: any) {
      if (error instanceof BadRequestError) throw error;
      throw new BadRequestError("Failed to read PDF file. Please upload a valid PDF resume.");
    }
  }

  private static async extractFromDocx(buffer: Buffer): Promise<string> {
    try {
      const result = await mammoth.extractRawText({ buffer });
      const text = result.value?.trim();
      if (!text) {
        throw new BadRequestError("Could not extract text from the DOCX file.");
      }
      return text;
    } catch (error: any) {
      if (error instanceof BadRequestError) throw error;
      throw new BadRequestError("Failed to read DOCX file. Please upload a valid DOCX resume.");
    }
  }
}
