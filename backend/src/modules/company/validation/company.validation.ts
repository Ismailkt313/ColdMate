import { z } from "zod";

const urlSchema = z.string().url("Must be a valid URL").optional().or(z.literal(""));

export const createCompanySchema = z.object({
  body: z.object({
    name: z.string({ required_error: "Company name is required" }).min(1, "Company name cannot be empty"),
    website: urlSchema,
    industry: z.string().optional(),
    companySize: z.string().optional(),
    headquarters: z.string().optional(),
    country: z.string().optional(),
    foundedYear: z.string().optional(),
    careersPage: urlSchema,
    linkedin: urlSchema,
    glassdoor: urlSchema,
    github: urlSchema,
    techStack: z.array(z.string()).optional(),
    description: z.string().optional(),
    notes: z.string().optional(),
    status: z
      .enum([
        "NOT_RESEARCHED",
        "RESEARCHING",
        "READY_TO_APPLY",
        "APPLIED",
        "INTERVIEW",
        "ASSESSMENT",
        "OFFER",
        "REJECTED",
        "GHOSTED",
        "ARCHIVED",
      ])
      .optional(),
    priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
    applicationDate: z.string().datetime("Must be a valid ISO date string").optional().or(z.literal("")),
    aiResearch: z
      .object({
        companySummary: z.string().optional(),
        industry: z.string().optional(),
        companySize: z.string().optional(),
        website: z.string().optional(),
        careersPage: z.string().optional(),
        linkedin: z.string().optional(),
        glassdoor: z.string().optional(),
        github: z.string().optional(),
        techStack: z.array(z.string()).optional(),
        headquarters: z.string().optional(),
        country: z.string().optional(),
        foundedYear: z.string().optional(),
        recentNews: z.array(z.string()).optional(),
        hiringStatus: z.string().optional(),
        confidence: z.number().optional(),
      })
      .optional(),
    researchStatus: z.enum(["PENDING", "PROCESSING", "COMPLETED", "FAILED"]).optional(),
  }),
});

export const analyzeCompanySchema = z.object({
  body: z.object({
    name: z.string({ required_error: "Company name is required" }).min(1, "Company name cannot be empty"),
    website: urlSchema,
    advancedOptions: z
      .object({
        targetRole: z.string().optional(),
        jobUrl: urlSchema,
        focus: z.string().optional(),
        technologies: z.array(z.string()).or(z.string()).optional(),
        instructions: z.string().optional(),
      })
      .optional(),
  }),
});


export const updateCompanySchema = z.object({
  body: z.object({
    name: z.string().min(1, "Company name cannot be empty").optional(),
    website: urlSchema,
    industry: z.string().optional(),
    companySize: z.string().optional(),
    headquarters: z.string().optional(),
    country: z.string().optional(),
    foundedYear: z.string().optional(),
    careersPage: urlSchema,
    linkedin: urlSchema,
    glassdoor: urlSchema,
    github: urlSchema,
    techStack: z.array(z.string()).optional(),
    description: z.string().optional(),
    notes: z.string().optional(),
    status: z
      .enum([
        "NOT_RESEARCHED",
        "RESEARCHING",
        "READY_TO_APPLY",
        "APPLIED",
        "INTERVIEW",
        "ASSESSMENT",
        "OFFER",
        "REJECTED",
        "GHOSTED",
        "ARCHIVED",
      ])
      .optional(),
    priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
    applicationDate: z.string().datetime("Must be a valid ISO date string").optional().or(z.literal("")).nullable(),
  }),
});

export const getCompaniesQuerySchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    search: z.string().optional(),
    status: z.string().optional(),
    priority: z.string().optional(),
  }),
});
