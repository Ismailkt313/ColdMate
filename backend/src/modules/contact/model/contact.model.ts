import { Schema, model, Document, Types } from "mongoose";
import { IContact } from "../types";

export interface IContactDocument extends Omit<IContact, "_id" | "userId" | "companyId">, Document {
  userId: Types.ObjectId;
  companyId: Types.ObjectId;
}

const ContactSchema = new Schema<IContactDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    jobTitle: {
      type: String,
      default: "",
      trim: true,
    },
    department: {
      type: String,
      default: "",
      trim: true,
    },
    email: {
      type: String,
      default: "",
      trim: true,
    },
    phone: {
      type: String,
      default: "",
      trim: true,
    },
    linkedin: {
      type: String,
      default: "",
      trim: true,
    },
    sourceUrl: {
      type: String,
      default: "",
      trim: true,
    },
    sourceType: {
      type: String,
      enum: ["OFFICIAL_WEBSITE", "CAREERS_PAGE", "LINKEDIN", "PUBLIC_DIRECTORY", "PRESS_RELEASE", "OTHER"],
      default: "OTHER",
    },
    confidenceScore: {
      type: Number,
      default: 0,
    },
    validationStatus: {
      type: String,
      enum: ["UNVERIFIED", "AI_VALIDATED", "USER_VERIFIED", "USER_REJECTED"],
      default: "UNVERIFIED",
    },
    aiNotes: {
      type: String,
      default: "",
    },
    isPreferred: {
      type: Boolean,
      default: false,
    },
    verifiedAt: {
      type: Schema.Types.Date,
    },
  },
  { timestamps: true }
);

// Optimize retrieval index
ContactSchema.index({ userId: 1, companyId: 1 });
ContactSchema.index({ userId: 1, email: 1 });
ContactSchema.index({ userId: 1, linkedin: 1 });

export const ContactModel = model<IContactDocument>("Contact", ContactSchema);
