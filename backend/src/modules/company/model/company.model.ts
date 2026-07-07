import { Schema, model, Document, Types } from "mongoose";
import { ICompany, ICompanyDetails, IAIResearch } from "../types";

export interface ICompanyDocument extends Omit<ICompany, "_id" | "userId">, Document {
  userId: Types.ObjectId;
}

const CompanyDetailsSchema = new Schema<ICompanyDetails>(
  {
    name: { type: String, required: true, trim: true },
    website: { type: String, default: "", trim: true },
    industry: { type: String, default: "", trim: true },
    companySize: { type: String, default: "", trim: true },
    headquarters: { type: String, default: "", trim: true },
    country: { type: String, default: "", trim: true },
    foundedYear: { type: String, default: "", trim: true },
    careersPage: { type: String, default: "", trim: true },
    linkedin: { type: String, default: "", trim: true },
    glassdoor: { type: String, default: "", trim: true },
    github: { type: String, default: "", trim: true },
    techStack: { type: [String], default: [] },
    description: { type: String, default: "", trim: true },
  },
  { _id: false }
);

const AIResearchSchema = new Schema<IAIResearch>(
  {
    companySummary: { type: String, default: "" },
    industry: { type: String, default: "" },
    companySize: { type: String, default: "" },
    website: { type: String, default: "" },
    careersPage: { type: String, default: "" },
    linkedin: { type: String, default: "" },
    glassdoor: { type: String, default: "" },
    github: { type: String, default: "" },
    techStack: { type: [String], default: [] },
    headquarters: { type: String, default: "" },
    country: { type: String, default: "" },
    foundedYear: { type: String, default: "" },
    recentNews: { type: [String], default: [] },
    hiringStatus: { type: String, default: "" },
    confidence: { type: Number, default: 0 },
  },
  { _id: false }
);

const CompanySchema = new Schema<ICompanyDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: [
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
      ],
      default: "NOT_RESEARCHED",
      index: true,
    },
    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH"],
      default: "MEDIUM",
      index: true,
    },
    notes: {
      type: String,
      default: "",
    },
    applicationDate: {
      type: Schema.Types.Date,
    },
    manualData: {
      type: CompanyDetailsSchema,
      required: true,
    },
    aiResearch: {
      type: AIResearchSchema,
    },
    researchStatus: {
      type: String,
      enum: ["PENDING", "PROCESSING", "COMPLETED", "FAILED"],
      default: "PENDING",
      index: true,
    },
    researchedAt: {
      type: Schema.Types.Date,
    },
  },
  { timestamps: true }
);

// Compound indexes for searching and filtering by user
CompanySchema.index({ userId: 1, "manualData.name": 1 });
CompanySchema.index({ userId: 1, status: 1 });
CompanySchema.index({ userId: 1, priority: 1 });

export const CompanyModel = model<ICompanyDocument>("Company", CompanySchema);
