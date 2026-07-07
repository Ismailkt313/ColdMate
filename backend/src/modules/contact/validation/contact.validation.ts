import { z } from "zod";

const urlSchema = z.string().url("Must be a valid URL").optional().or(z.literal(""));
const emailSchema = z.string().email("Must be a valid email").optional().or(z.literal(""));

export const createContactSchema = z.object({
  body: z.object({
    companyId: z.string({ required_error: "Company ID is required" }).min(1, "Company ID cannot be empty"),
    fullName: z.string({ required_error: "Full name is required" }).min(1, "Full name cannot be empty"),
    jobTitle: z.string().optional(),
    department: z.string().optional(),
    email: emailSchema,
    phone: z.string().optional(),
    linkedin: urlSchema,
    sourceUrl: urlSchema,
    sourceType: z.enum(["OFFICIAL_WEBSITE", "CAREERS_PAGE", "LINKEDIN", "PUBLIC_DIRECTORY", "PRESS_RELEASE", "OTHER"]).optional(),
    confidenceScore: z.number().optional(),
    validationStatus: z.enum(["UNVERIFIED", "AI_VALIDATED", "USER_VERIFIED", "USER_REJECTED"]).optional(),
    aiNotes: z.string().optional(),
    isPreferred: z.boolean().optional(),
  }),
});

export const createContactBatchSchema = z.object({
  body: z.object({
    companyId: z.string({ required_error: "Company ID is required" }).min(1, "Company ID cannot be empty"),
    contacts: z.array(
      z.object({
        fullName: z.string({ required_error: "Full name is required" }).min(1, "Full name cannot be empty"),
        jobTitle: z.string().optional(),
        department: z.string().optional(),
        email: emailSchema,
        phone: z.string().optional(),
        linkedin: urlSchema,
        sourceUrl: urlSchema,
        sourceType: z.enum(["OFFICIAL_WEBSITE", "CAREERS_PAGE", "LINKEDIN", "PUBLIC_DIRECTORY", "PRESS_RELEASE", "OTHER"]).optional(),
        confidenceScore: z.number().optional(),
        validationStatus: z.enum(["UNVERIFIED", "AI_VALIDATED", "USER_VERIFIED", "USER_REJECTED"]).optional(),
        aiNotes: z.string().optional(),
        isPreferred: z.boolean().optional(),
      })
    ),
  }),
});

export const updateContactSchema = z.object({
  body: z.object({
    fullName: z.string().min(1, "Full name cannot be empty").optional(),
    jobTitle: z.string().optional(),
    department: z.string().optional(),
    email: emailSchema,
    phone: z.string().optional(),
    linkedin: urlSchema,
    sourceUrl: urlSchema,
    sourceType: z.enum(["OFFICIAL_WEBSITE", "CAREERS_PAGE", "LINKEDIN", "PUBLIC_DIRECTORY", "PRESS_RELEASE", "OTHER"]).optional(),
    confidenceScore: z.number().optional(),
    validationStatus: z.enum(["UNVERIFIED", "AI_VALIDATED", "USER_VERIFIED", "USER_REJECTED"]).optional(),
    aiNotes: z.string().optional(),
    isPreferred: z.boolean().optional(),
  }),
});

export const discoverContactsSchema = z.object({
  body: z.object({
    companyId: z.string({ required_error: "Company ID is required" }).min(1, "Company ID cannot be empty"),
    mode: z.enum(["standard", "deep"]).optional(),
  }),
});
