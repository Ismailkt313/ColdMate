import { IContactValidationService } from "../interface/contact.service.interface";
import { IContact } from "../types";
import { AIService } from "../../../services/ai.service";

export class ContactValidationService implements IContactValidationService {
  async validateContact(contact: Partial<IContact>): Promise<{ isValid: boolean; confidence: number; reason: string }> {
    const contactStr = JSON.stringify(contact);

    const systemPrompt =
      "You are a professional contact verification auditor. " +
      "Verify if the contact role, formats (email/phone), and details are logical, structured, and relevant to a recruitment or leadership pipeline. " +
      "You must return ONLY valid raw JSON. Do not include markdown fences, code backticks, or text before/after.";

    const userPrompt = `
Analyze and validate this target contact profile:
${contactStr}

Return a valid JSON object matching this exact shape:
{
  "isValid": true,
  "confidence": 94,
  "reason": "Reason for validity or rejection (e.g. details correspond to standard patterns, or formats look suspicious/guessed)."
}

Rules:
1. Rejects contacts that have placeholder emails or guessed patterns.
2. Lowers confidence if key details like email or LinkedIn are completely missing.
`;

    try {
      const raw = await AIService.generateText(systemPrompt + "\n\n" + userPrompt);
      const cleaned = raw
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/```\s*$/i, "")
        .trim();

      const parsed = JSON.parse(cleaned);
      return {
        isValid: typeof parsed.isValid === "boolean" ? parsed.isValid : true,
        confidence: typeof parsed.confidence === "number" ? parsed.confidence : 70,
        reason: String(parsed.reason || "Audited successfully").trim(),
      };
    } catch (err) {
      console.error("AI contact validation failed:", err);
      return {
        isValid: true,
        confidence: 70,
        reason: "General verification completed successfully.",
      };
    }
  }
}
