import { GoogleGenAI } from "@google/genai";
import { IParsedResume } from "../modules/resume/types";
import { BadRequestError, InternalServerError } from "../errors";

// Define the interface for the AI Provider to allow easy replacement (scalability rule)
export interface IAIProvider {
  parseResume(extractedText: string, prompt: string): Promise<string>;
  generateText?(prompt: string): Promise<string>;
}

// Default parsed resume structure mapping missing fields
const EMPTY_PARSED_RESUME: IParsedResume = {
  fullName: "",
  email: "",
  phone: "",
  location: "",
  summary: "",
  skills: [],
  experience: [],
  education: [],
  projects: [],
  certifications: [],
  achievements: [],
  languages: [],
  preferredRoles: [],
};

const SYSTEM_PROMPT =
  "You are a structured resume parser. Extract information from the resume text and return a valid JSON object. " +
  "Return ONLY valid JSON. No markdown, no explanations, no code blocks, no extra text. " +
  "If information is unavailable, use empty string or empty array. Do not fabricate or infer.";

const PARSE_RESUME_PROMPT = `
Extract data from the resume text and return a valid JSON matching this exact structure:
{
  "fullName": "",
  "email": "",
  "phone": "",
  "location": "",
  "summary": "",
  "skills": [],
  "experience": [
    {
      "company": "",
      "title": "",
      "startDate": "",
      "endDate": "",
      "description": ""
    }
  ],
  "education": [
    {
      "institution": "",
      "degree": "",
      "field": "",
      "startDate": "",
      "endDate": ""
    }
  ],
  "projects": [
    {
      "name": "",
      "description": "",
      "technologies": [],
      "url": ""
    }
  ],
  "certifications": [
    {
      "name": "",
      "issuer": "",
      "date": ""
    }
  ],
  "achievements": [],
  "languages": [],
  "preferredRoles": []
}

Rules:
1. Return ONLY valid JSON. No markdown, no explanations, no code blocks.
2. Never fabricate information. Only extract what exists in the resume.
`;

const STRICT_RETRY_PROMPT = `
WARNING: Your previous response was invalid.
You MUST return ONLY a valid raw JSON object.
No markdown block, no code fences, no explanations, no text before or after the JSON.
Start your response with { and end with }.
`;

const DOCUMENT_VALIDATION_PROMPT = `
Analyze the following document text and determine if it is a professional resume or CV.
Categorize the document into one of these types:
RESUME, CV, COVER_LETTER, INVOICE, BILL, BANK_STATEMENT, AADHAAR, PAN_CARD, PASSPORT, DRIVING_LICENSE, CERTIFICATE, MARKSHEET, LETTER, AGREEMENT, OTHER

Return a valid JSON object matching this exact structure:
{
  "isResume": true,
  "documentType": "RESUME",
  "confidence": 99,
  "reason": "..."
}

Rules:
1. Return ONLY valid JSON. No markdown, no explanations, no code blocks.
2. If the document is a resume or CV, isResume must be true. For all other types, it must be false.
`;

/**
 * Clean and parse the raw JSON string safely
 */
function parseJsonSafely(raw: string): IParsedResume | null {
  const cleaned = raw
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  try {
    const parsed = JSON.parse(cleaned);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      return null;
    }
    return { ...EMPTY_PARSED_RESUME, ...parsed };
  } catch {
    return null;
  }
}

/**
 * Google Gemini Provider implementation
 */
export class GeminiProvider implements IAIProvider {
  private client: GoogleGenAI;
  private model: string;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new InternalServerError("Google Gemini API key is not configured");
    }
    this.client = new GoogleGenAI({ apiKey });
    this.model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  }

  async parseResume(extractedText: string, prompt: string): Promise<string> {
    try {
      const response = await this.client.models.generateContent({
        model: this.model,
        contents: SYSTEM_PROMPT + "\n\n" + prompt + "\n\nResume Text:\n" + extractedText,
        config: {
          responseMimeType: "application/json",
        },
      });

      const rawText = response.text?.trim() ?? "";
      if (!rawText) {
        throw new BadRequestError("Received an empty response from Google Gemini API.");
      }
      return rawText;
    } catch (err: any) {
      if (err instanceof BadRequestError || err instanceof InternalServerError) {
        throw err;
      }
      
      const errStr = JSON.stringify(err);
      if (errStr.includes("API_KEY_INVALID") || err.message?.includes("API key not valid")) {
        throw new BadRequestError("Invalid Google Gemini API key configured.");
      }
      if (errStr.includes("RESOURCE_EXHAUSTED") || err.status === 429 || err.message?.includes("quota")) {
        throw new BadRequestError("Google Gemini API rate limit exceeded. Please try again later.");
      }
      if (err.message?.includes("timeout") || err.code === "ETIMEDOUT") {
        throw new BadRequestError("Google Gemini API call timed out.");
      }
      throw new InternalServerError(`Google Gemini API failure: ${err.message || err}`);
    }
  }

  async generateText(prompt: string): Promise<string> {
    try {
      const response = await this.client.models.generateContent({
        model: this.model,
        contents: prompt,
      });
      return response.text?.trim() ?? "";
    } catch (err: any) {
      throw new InternalServerError(`Google Gemini API failure: ${err.message || err}`);
    }
  }
}

/**
 * Placeholder Grok Provider for scalability
 */
export class GrokProvider implements IAIProvider {
  async parseResume(): Promise<string> {
    throw new InternalServerError("Grok provider is not implemented yet");
  }
}

/**
 * Placeholder OpenAI Provider for scalability
 */
export class OpenAIProvider implements IAIProvider {
  async parseResume(): Promise<string> {
    throw new InternalServerError("OpenAI provider is not implemented yet");
  }
}

/**
 * Dynamic AI Provider Factory
 */
function getAIProvider(): IAIProvider {
  const providerType = (process.env.AI_PROVIDER || "GEMINI").toUpperCase();
  switch (providerType) {
    case "GEMINI":
      return new GeminiProvider();
    case "GROK":
      return new GrokProvider();
    case "OPENAI":
      return new OpenAIProvider();
    default:
      throw new InternalServerError(`Unsupported AI provider: ${providerType}`);
  }
}

/**
 * Core AI Service
 */
export class AIService {
  /**
   * Parse extracted resume text into structured JSON using Gemini with validation & retry logic
   */
  static async parseResume(extractedText: string): Promise<IParsedResume> {
    const provider = getAIProvider();

    // 1. Initial attempt
    const firstRaw = await provider.parseResume(extractedText, PARSE_RESUME_PROMPT);
    const firstResult = parseJsonSafely(firstRaw);
    if (firstResult) {
      return firstResult;
    }

    // 2. Stricter retry attempt on parsing failure
    const retryPrompt = PARSE_RESUME_PROMPT + "\n\n" + STRICT_RETRY_PROMPT;
    const retryRaw = await provider.parseResume(extractedText, retryPrompt).catch(() => "");
    const retryResult = parseJsonSafely(retryRaw);
    if (retryResult) {
      return retryResult;
    }

    // Throw validation error on second failure
    throw new BadRequestError(
      "The AI response validation failed. The returned structure was malformed. Please try again."
    );
  }

  /**
   * Validate if the extracted text belongs to a professional resume
   */
  static async validateDocument(extractedText: string): Promise<{
    isResume: boolean;
    documentType: string;
    confidence: number;
    reason: string;
  }> {
    const provider = getAIProvider();
    const raw = await provider.parseResume(extractedText, DOCUMENT_VALIDATION_PROMPT);
    const cleaned = raw
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();

    try {
      const parsed = JSON.parse(cleaned);
      return {
        isResume: Boolean(parsed.isResume),
        documentType: String(parsed.documentType || "OTHER").toUpperCase(),
        confidence: Number(parsed.confidence ?? 0),
        reason: String(parsed.reason || "")
      };
    } catch {
      throw new BadRequestError("Failed to validate document structure from Google Gemini API.");
    }
  }

  /**
   * Generate cold outreach emails based on a prompt
   */
  static async generateColdEmail(prompt: string): Promise<string> {
    const provider = getAIProvider();
    if (provider.generateText) {
      return provider.generateText(prompt);
    }
    throw new InternalServerError("The selected provider does not support text generation");
  }

  /**
   * Summarize company profile or domain information
   */
  static async summarizeCompany(prompt: string): Promise<string> {
    const provider = getAIProvider();
    if (provider.generateText) {
      return provider.generateText(prompt);
    }
    throw new InternalServerError("The selected provider does not support text generation");
  }

  /**
   * Generate a follow-up email script
   */
  static async generateFollowUp(prompt: string): Promise<string> {
    const provider = getAIProvider();
    if (provider.generateText) {
      return provider.generateText(prompt);
    }
    throw new InternalServerError("The selected provider does not support text generation");
  }

  /**
   * Classify response emails (e.g. positive, negative, auto-reply)
   */
  static async classifyReply(prompt: string): Promise<string> {
    const provider = getAIProvider();
    if (provider.generateText) {
      return provider.generateText(prompt);
    }
    throw new InternalServerError("The selected provider does not support text generation");
  }
}
