import { GoogleGenAI } from "@google/genai";
import { IParsedResume } from "../modules/resume/types";
import { IAIResearch } from "../modules/company/types";
import { BadRequestError, InternalServerError } from "../errors";

// Define the interface for the AI Provider to allow easy replacement
export interface IAIProvider {
  parseResume(extractedText: string, prompt: string): Promise<string>;
  generateText?(prompt: string): Promise<string>;
  researchCompany?(name: string, websiteUrl?: string, advancedOptions?: any): Promise<string>;

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
  "reason": "...",
  "parsedResume": {}
}

If not a resume:
{
  "isResume": false,
  "documentType": "INVOICE",
  "confidence": 98,
  "reason": "...",
  "parsedResume": null
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
 * Clean and parse company research JSON safely
 */
function parseCompanyJson(raw: string): IAIResearch | null {
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
    return {
      companySummary: String(parsed.companySummary || ""),
      industry: String(parsed.industry || ""),
      companySize: String(parsed.companySize || ""),
      website: String(parsed.website || ""),
      careersPage: String(parsed.careersPage || ""),
      linkedin: String(parsed.linkedin || ""),
      glassdoor: String(parsed.glassdoor || ""),
      github: String(parsed.github || ""),
      techStack: Array.isArray(parsed.techStack) ? parsed.techStack.map(String) : [],
      headquarters: String(parsed.headquarters || ""),
      country: String(parsed.country || ""),
      foundedYear: String(parsed.foundedYear || ""),
      recentNews: Array.isArray(parsed.recentNews) ? parsed.recentNews.map(String) : [],
      hiringStatus: String(parsed.hiringStatus || ""),
      confidence: typeof parsed.confidence === "number" ? parsed.confidence : 0,
    };
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
      throw new InternalServerError(`Google Gemini API failure: ${err.ApiError?.message || err}`);
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
      throw new InternalServerError(`Google Gemini API failure: ${err.ApiError?.message || err}`);
    }
  }
}

/**
 * Groq API Provider implementation
 */
export class GroqProvider implements IAIProvider {
  private apiKey: string;
  private baseUrl: string;
  private model: string;

  constructor() {
    this.apiKey = process.env.GROQ_API_KEY || "";
    this.baseUrl = process.env.GROQ_BASE_URL || "https://api.groq.com/openai/v1";
    this.model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

    if (!this.apiKey) {
      throw new InternalServerError("Groq API key is not configured.");
    }
  }

  private async callGroqWithRetry(systemPrompt: string, userPrompt: string): Promise<string> {
    const maxRetries = 1;
    let retryCount = 0;
    const startTime = Date.now();

    while (true) {
      try {
        const response = await fetch(`${this.baseUrl}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            model: this.model,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
            temperature: 0.1,
            response_format: { type: "json_object" },
          }),
        });

        const responseTime = Date.now() - startTime;

        if (response.ok) {
          const data = await response.json();
          const content = data.choices?.[0]?.message?.content?.trim();

          console.log(`[AI Provider: Groq] Model: ${this.model} | Response Time: ${responseTime}ms | Retry Count: ${retryCount}`);

          if (!content) {
            throw new BadRequestError("Received empty response content from Groq API.");
          }

          try {
            JSON.parse(content);
          } catch {
            throw new BadRequestError("Groq AI response is not in a valid JSON format.");
          }

          return content;
        }

        const status = response.status;
        const errorText = await response.text().catch(() => "");

        if ([429, 500, 502, 503, 504].includes(status) && retryCount < maxRetries) {
          retryCount++;
          const backoffDelay = Math.pow(2, retryCount) * 1500;
          console.warn(`[AI Provider: Groq] HTTP ${status} error. Retrying in ${backoffDelay}ms... (Attempt ${retryCount}/${maxRetries})`);
          await new Promise((resolve) => setTimeout(resolve, backoffDelay));
          continue;
        }

        if (status === 401) {
          throw new BadRequestError("Invalid Groq API key configured.");
        } else if (status === 404) {
          throw new BadRequestError(`Invalid Groq model configured: "${this.model}".`);
        } else if (status === 429) {
          throw new BadRequestError("Groq API rate limit exceeded. Please try again later.");
        } else {
          throw new InternalServerError(`Groq API error (status ${status}): ${errorText}`);
        }
      } catch (err: any) {
        if (err instanceof BadRequestError || err instanceof InternalServerError) {
          throw err;
        }

        if (err.name === "AbortError" || err.message?.includes("timeout") || err.code === "ETIMEDOUT") {
          throw new BadRequestError("Groq API call timed out.");
        }

        if (retryCount < maxRetries) {
          retryCount++;
          const backoffDelay = Math.pow(2, retryCount) * 1500;
          console.warn(`[AI Provider: Groq] Network error: ${err.message || err}. Retrying in ${backoffDelay}ms...`);
          await new Promise((resolve) => setTimeout(resolve, backoffDelay));
          continue;
        }

        throw new InternalServerError(`Groq API connection failure: ${err.message || err}`);
      }
    }
  }

  async parseResume(extractedText: string, prompt: string): Promise<string> {
    return this.callGroqWithRetry(
      "You are a structured resume parser. Extract information from the resume text and return a valid JSON object matching the schema. Return JSON ONLY. No markdown, no explanations, no code blocks.",
      prompt + "\n\nResume Text:\n" + extractedText
    );
  }

  async generateText(prompt: string): Promise<string> {
    const systemPrompt = 
      "You are a helpful AI assistant. You must return a valid JSON object with a single 'text' key. " +
      "Return JSON ONLY. No markdown, no explanations, no code fences.";
    const userPrompt = `${prompt}\n\nReturn your response as a valid JSON object in this format:\n{ "text": "your response here" }`;

    const raw = await this.callGroqWithRetry(systemPrompt, userPrompt);
    try {
      const parsed = JSON.parse(raw);
      return String(parsed.text || "");
    } catch {
      throw new BadRequestError("Failed to parse output JSON from Groq API.");
    }
  }

  async researchCompany(name: string, websiteUrl?: string, advancedOptions?: any): Promise<string> {
    const systemPrompt =
      "You are a company intelligence researcher. Analyze the requested company and return a valid JSON object matching the schema. " +
      "Return ONLY valid raw JSON. No markdown, no explanations, no code blocks, no text before or after the JSON. " +
      "Never fabricate information. If information is unavailable, return empty string, empty array, or null.";

    let advancedPrompt = "";
    if (advancedOptions) {
      const { targetRole, jobUrl, focus, technologies, instructions } = advancedOptions;
      advancedPrompt += "\n\nAdvanced Context for Research:";
      if (targetRole) {
        advancedPrompt += `\n- Target Job Role: "${targetRole}". Focus on what this company requires or targets regarding this role.`;
      }
      if (jobUrl) {
        advancedPrompt += `\n- Job URL: "${jobUrl}". Prioritize researching this specific job post. Extract tech stack, teams, and hiring info directly from this link.`;
      }
      if (focus) {
        advancedPrompt += `\n- Core Focus Area: "${focus}". Provide deeper, more detailed information in the summary and news related to this area.`;
      }
      if (technologies && (Array.isArray(technologies) ? technologies.length > 0 : String(technologies).trim().length > 0)) {
        const techList = Array.isArray(technologies) ? technologies : String(technologies).split(",").map(t => t.trim());
        advancedPrompt += `\n- Target Technologies: ${techList.join(", ")}. Prioritize checking if they use these technologies and adding them to the techStack.`;
      }
      if (instructions) {
        advancedPrompt += `\n- Additional User Instructions: "${instructions}". Adhere strictly to these guidelines.`;
      }
    }

    const userPrompt = `
Research the company with the following details:
Company Name: "${name}"
${websiteUrl ? `Website: "${websiteUrl}"` : ""}
${advancedPrompt}

Return a structured JSON object matching this exact shape:
{
  "companySummary": "A brief summary/description of the company, what they do, and their value proposition.",
  "industry": "Industry category (e.g. Software, E-Commerce, Healthcare).",
  "companySize": "Estimated size (e.g. 50-100 employees, 1000-5000 employees).",
  "website": "URL to the main website.",
  "careersPage": "URL to their careers/jobs page.",
  "linkedin": "URL to their LinkedIn company page.",
  "glassdoor": "URL to their Glassdoor company page.",
  "github": "URL to their official GitHub organization (if any).",
  "techStack": ["Technology1", "Technology2"],
  "headquarters": "City, State/Region.",
  "country": "Country where headquartered.",
  "foundedYear": "Year the company was founded.",
  "recentNews": ["News item 1", "News item 2"],
  "hiringStatus": "Current hiring status (e.g., Actively Hiring, Hiring Freeze, Unknown).",
  "confidence": 85
}

Rules:
1. Return ONLY the JSON object. Do not wrap in markdown (do NOT use \`\`\`json or similar backticks). Start with { and end with }.
2. If any field is unavailable, set it to empty string "", empty array [], or null. Never fabricate data.
3. The confidence should be a number from 0 to 100 indicating how certain you are of the information.
`;

    return this.callGroqWithRetry(systemPrompt, userPrompt);
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
    case "GROQ":
      return new GroqProvider();
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
    parsedResume?: any;
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
        reason: String(parsed.reason || ""),
        parsedResume: parsed.parsedResume !== undefined ? parsed.parsedResume : (Boolean(parsed.isResume) ? {} : null)
      };
    } catch {
      throw new BadRequestError("Failed to validate document structure from AI provider.");
    }
  }

  static async researchCompany(name: string, websiteUrl?: string, advancedOptions?: any): Promise<IAIResearch> {
    const provider = getAIProvider();
    if (provider.researchCompany) {
      const raw = await provider.researchCompany(name, websiteUrl, advancedOptions);
      const parsed = parseCompanyJson(raw);
      if (parsed) {
        return parsed;
      }
      throw new BadRequestError("Failed to parse company research from AI provider.");
    }
    throw new InternalServerError("The selected AI provider does not support company research.");
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

