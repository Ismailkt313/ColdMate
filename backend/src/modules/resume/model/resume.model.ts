import { Schema, model, Document, Types } from "mongoose";
import { IResume, IParsedResume } from "../types";

export interface IResumeDocument extends Omit<IResume, "_id" | "userId">, Document {
  userId: Types.ObjectId;
}

const ParsedResumeSchema = new Schema<IParsedResume>(
  {
    fullName: { type: String, default: "" },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    location: { type: String, default: "" },
    summary: { type: String, default: "" },
    skills: { type: [String], default: [] },
    experience: {
      type: [
        {
          company: { type: String, default: "" },
          title: { type: String, default: "" },
          startDate: { type: String, default: "" },
          endDate: { type: String, default: "" },
          description: { type: String, default: "" },
        },
      ],
      default: [],
    },
    education: {
      type: [
        {
          institution: { type: String, default: "" },
          degree: { type: String, default: "" },
          field: { type: String, default: "" },
          startDate: { type: String, default: "" },
          endDate: { type: String, default: "" },
        },
      ],
      default: [],
    },
    projects: {
      type: [
        {
          name: { type: String, default: "" },
          description: { type: String, default: "" },
          technologies: { type: [String], default: [] },
          url: { type: String, default: "" },
        },
      ],
      default: [],
    },
    certifications: {
      type: [
        {
          name: { type: String, default: "" },
          issuer: { type: String, default: "" },
          date: { type: String, default: "" },
        },
      ],
      default: [],
    },
    achievements: { type: [String], default: [] },
    languages: { type: [String], default: [] },
    preferredRoles: { type: [String], default: [] },
  },
  { _id: false }
);

const ResumeSchema = new Schema<IResumeDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    resumeName: { type: String, required: true },
    resumeUrl: { type: String, required: true },
    resumePublicId: { type: String, required: true },
    extractedText: { type: String, default: "" },
    status: { type: String, required: true, default: "parsed" },
    fileSize: { type: Number, required: true, default: 0 },
    parsedData: { type: ParsedResumeSchema, default: () => ({}) },
  },
  { timestamps: true }
);

export const ResumeModel = model<IResumeDocument>("Resume", ResumeSchema);
