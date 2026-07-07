export type SourceType =
  | "OFFICIAL_WEBSITE"
  | "CAREERS_PAGE"
  | "LINKEDIN"
  | "PUBLIC_DIRECTORY"
  | "PRESS_RELEASE"
  | "OTHER";

export type ValidationStatus =
  | "UNVERIFIED"
  | "AI_VALIDATED"
  | "USER_VERIFIED"
  | "USER_REJECTED";

export interface IContact {
  _id?: string;
  userId?: string;
  companyId?: string;
  fullName: string;

  jobTitle: string;
  department?: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  sourceUrl?: string;
  sourceType: SourceType;
  confidenceScore: number;
  validationStatus: ValidationStatus;
  aiNotes?: string;
  isPreferred?: boolean;
  verifiedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}
